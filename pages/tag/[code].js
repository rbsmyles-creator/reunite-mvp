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

  return { props: { tag: data || null, code } };
}

export default function TagPage({ tag, code }) {
  useEffect(() => {
    fetch('/api/page-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
  }, [code]);

  if (!tag) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>Tag not found</h1>
          <p>This REUNITE tag is not active.</p>
        </div>
      </main>
    );
  }

  const cleanPhone = tag.parent_phone.replace(/\D/g, '');
  const whatsappPhone = cleanPhone.startsWith('0')
    ? `27${cleanPhone.slice(1)}`
    : cleanPhone;

  const whatsappText = encodeURIComponent(
    `Hi, I found ${tag.child_name}'s bag/item. I scanned the REUNITE tag.`
  );

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>REUNITE</div>

        <h1 style={styles.title}>Emergency Contact</h1>

        <p style={styles.subtitle}>
          I may be lost. Please help me get home.
        </p>

        <div style={styles.childBox}>
          <div style={styles.label}>Name</div>
          <div style={styles.childName}>{tag.child_name}</div>
        </div>

        <div style={styles.infoBox}>
          <p><strong>Parent:</strong> {tag.parent_name}</p>
          <p><strong>Medical notes:</strong> {tag.medical_notes || 'None listed'}</p>
          <p><strong>Tag ID:</strong> {code}</p>
        </div>

        <a href={`tel:${tag.parent_phone}`} style={styles.link}>
          <button style={styles.primaryButton}>📞 Call Parent</button>
        </a>

        <a
          href={`https://wa.me/${whatsappPhone}?text=${whatsappText}`}
          style={styles.link}
        >
          <button style={styles.whatsappButton}>💬 WhatsApp Parent</button>
        </a>

        <button style={styles.locationButton} onClick={() => shareLocation(code)}>
          📍 Share My Location
        </button>

        <p style={styles.footer}>
          Thank you for helping. Your kindness matters.
        </p>
      </div>
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

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f6fb',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: 'white',
    borderRadius: 22,
    padding: 24,
    maxWidth: 430,
    width: '100%',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
    textAlign: 'center'
  },
  badge: {
    display: 'inline-block',
    background: '#0f766e',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 999,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 14
  },
  title: {
    fontSize: 30,
    margin: '8px 0'
  },
  subtitle: {
    color: '#555',
    fontSize: 16
  },
  childBox: {
    background: '#eefdf9',
    borderRadius: 16,
    padding: 16,
    margin: '20px 0'
  },
  label: {
    fontSize: 13,
    color: '#666'
  },
  childName: {
    fontSize: 28,
    fontWeight: 'bold'
  },
  infoBox: {
    textAlign: 'left',
    background: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    fontSize: 15
  },
  link: {
    textDecoration: 'none'
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    border: 'none',
    background: '#0f172a',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  whatsappButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    border: 'none',
    background: '#16a34a',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  locationButton: {
    width: '100%',
    padding: 16,
    borderRadius: 14,
    border: 'none',
    background: '#2563eb',
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 14
  },
  footer: {
    color: '#666',
    fontSize: 13
  }
};
