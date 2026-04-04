// ============================================
// Données chargées depuis l'API (plus de fausses annonces)
// ============================================
let PROPERTIES_DATA = [];
let BOOKINGS_DATA = [];

async function loadProperties() {
  try {
    const res = await fetch('/api/properties');
    PROPERTIES_DATA = await res.json();
  } catch (err) {
    console.error('Erreur chargement propriétés:', err);
    PROPERTIES_DATA = [];
  }
  return PROPERTIES_DATA;
}
