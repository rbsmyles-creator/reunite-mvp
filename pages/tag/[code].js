import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getServerSideProps(context) {
  const { code } = context.params;

  const { data } = await supabase
    .from('public_tag_info')
    .select('*')
    .eq('tag_code', code)
    .single();

  return {
    props: {
      tag: data || null,
      code
    }
  };
}

export default function TagPage({ tag, code }) {
  if (!tag) {
    return <h1>Tag not found</h1>;
  }

  const whatsappLink = `https://wa.me/27${tag.parent_phone.slice(1)}?text=Hi, I found ${tag.child_name}'s bag.`;

  return (
    <main style={{ fontFamily: 'Arial', padding: 24, maxWidth: 500, margin: 'auto' }}>
      <h1>Emergency Contact</h1>
      <h2>{tag.child_name}</h2>

      <p><strong>Medical notes:</strong> {tag.medical_notes}</p>
      <p><strong>Parent:</strong> {tag.parent_name}</p>

      <a href={`tel:${tag.parent_phone}`}>
        <button>Call Parent</button>
      </a>

      <br /><br />

      <a href={whatsappLink}>
        <button>WhatsApp Parent</button>
      </a>

      <br /><br />

      <button onClick={() => shareLocation(code)}>
        Share My Location
      </button>
    </main>
  );
}

function shareLocation(code) {
  if (!navigator.geolocation) {
    alert('Location is not supported on this phone.');
    return;
  }

  alert('Your phone may ask for location permission. Please tap Allow.');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, latitude, longitude })
      });

      alert('Location shared. Thank you.');
    },
    (error) => {
      let message = 'Could not get location.';

      if (error.code === 1) {
        message = 'Location permission was blocked. Please allow location access in Safari settings.';
      }

      if (error.code === 2) {
        message = 'Location unavailable. Please check that Location Services are turned on.';
      }

      if (error.code === 3) {
        message = 'Location request timed out. Please try again.';
      }

      alert(message);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}
