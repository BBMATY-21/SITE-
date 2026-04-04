// ============================================
// MaisonSeason - Application JavaScript
// ============================================

const API_URL = '/api';

// ============================================
// Auth State
// ============================================
function getToken() { return localStorage.getItem('token'); }
function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}
function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
function authHeaders() {
  const t = getToken();
  return t ? { 'Authorization': 'Bearer ' + t, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// ============================================
// Update Navbar based on Auth
// ============================================
function updateNavbar() {
  const user = getUser();
  document.querySelectorAll('.btn-auth').forEach(btn => {
    if (user) {
      btn.textContent = user.firstName;
      btn.onclick = () => openModal('userMenuModal');
    } else {
      btn.textContent = 'Connexion';
      btn.onclick = () => openModal('loginModal');
    }
  });
  document.querySelectorAll('.nav-link-dashboard').forEach(el => {
    el.style.display = user && user.role === 'host' ? '' : 'none';
  });
  // Fill user menu modal info
  if (user) {
    const nameEl = document.getElementById('userMenuName');
    const emailEl = document.getElementById('userMenuEmail');
    const avatarEl = document.getElementById('userMenuAvatar');
    if (nameEl) nameEl.textContent = user.firstName + ' ' + user.lastName;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) {
      if (user.avatar) {
        avatarEl.innerHTML = `<img src="${user.avatar}" alt="${user.firstName}">`;
      } else {
        avatarEl.innerHTML = `<span>${user.firstName[0]}${user.lastName[0]}</span>`;
      }
    }
  }
}

// ============================================
// Navigation
// ============================================
function toggleNav() {
  document.querySelector('.nav-links').classList.toggle('active');
}

// ============================================
// Modals
// ============================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('active');
}
function switchModal(from, to) {
  closeModal(from);
  setTimeout(() => openModal(to), 200);
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
    e.target.classList.remove('active');
  }
});

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// Auth: Login & Register (API réelle)
// ============================================
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(API_URL + '/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setAuth(data.token, data.user);
    closeModal('loginModal');
    showToast('Bienvenue ' + data.user.firstName + ' !');
    updateNavbar();

    // Redirect host to dashboard
    if (data.user.role === 'host' && !window.location.pathname.includes('dashboard')) {
      window.location.href = 'dashboard.html';
    } else {
      window.location.reload();
    }
  } catch (err) {
    showToast(err.message || 'Erreur de connexion', 'error');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const body = {
    firstName: document.getElementById('regFirstName').value,
    lastName: document.getElementById('regLastName').value,
    email: document.getElementById('regEmail').value,
    phone: document.getElementById('regPhone').value,
    password: document.getElementById('regPassword').value,
    role: document.getElementById('regRole').value
  };

  try {
    const res = await fetch(API_URL + '/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setAuth(data.token, data.user);
    closeModal('registerModal');
    showToast('Inscription réussie ! Bienvenue ' + data.user.firstName);
    updateNavbar();

    if (data.user.role === 'host') {
      window.location.href = 'dashboard.html';
    } else {
      window.location.reload();
    }
  } catch (err) {
    showToast(err.message || 'Erreur d\'inscription', 'error');
  }
}

function handleLogout() {
  clearAuth();
  closeModal('userMenuModal');
  showToast('Déconnecté');
  updateNavbar();
  if (window.location.pathname.includes('dashboard')) {
    window.location.href = 'index.html';
  } else {
    window.location.reload();
  }
}

// ============================================
// Property Card HTML
// ============================================
function createPropertyCard(property) {
  const starsHtml = generateStars(property.rating || 0);
  const badgeHtml = property.badge ? `<span class="property-badge">${property.badge}</span>` : '';
  const image = property.images && property.images.length > 0
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
  const id = property._id || property.id;

  return `
    <div class="property-card" onclick="window.location.href='property.html?id=${id}'">
      <div class="property-card-image">
        ${badgeHtml}
        <img src="${image}" alt="${property.title}" loading="lazy">
      </div>
      <div class="property-card-body">
        <div class="property-location">
          <i class="fas fa-map-marker-alt"></i> ${property.address || property.location}
        </div>
        <h3>${property.title}</h3>
        <div class="property-features">
          <span><i class="fas fa-bed"></i> ${property.bedrooms} ch.</span>
          <span><i class="fas fa-bath"></i> ${property.bathrooms} sdb.</span>
          <span><i class="fas fa-users"></i> ${property.guests} pers.</span>
        </div>
        <div class="property-card-footer">
          <div class="property-price">
            ${property.pricePerNight}&euro; <span>/ nuit</span>
          </div>
          <div class="property-rating">
            <span class="stars">${starsHtml}</span>
            <strong>${(property.rating || 0).toFixed(1)}</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) html += '<i class="fas fa-star"></i>';
    else if (i - rating < 1) html += '<i class="fas fa-star-half-alt"></i>';
    else html += '<i class="far fa-star"></i>';
  }
  return html;
}

// ============================================
// Featured Properties (index.html)
// ============================================
async function displayFeaturedProperties() {
  const container = document.getElementById('featuredProperties');
  if (!container) return;

  await loadProperties();

  // Update hero stats dynamically
  const statProps = document.getElementById('statProperties');
  const statHosts = document.getElementById('statHosts');
  if (statProps) statProps.textContent = PROPERTIES_DATA.length;
  if (statHosts) {
    const uniqueOwners = new Set(PROPERTIES_DATA.map(p => p.owner?._id || p.owner).filter(Boolean));
    statHosts.textContent = uniqueOwners.size;
  }

  // Update destination counts
  document.querySelectorAll('.dest-count').forEach(el => {
    const region = el.dataset.region;
    const count = PROPERTIES_DATA.filter(p => p.location === region).length;
    el.textContent = count + ' annonce' + (count > 1 ? 's' : '');
  });

  if (PROPERTIES_DATA.length === 0) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#888;">Aucune annonce pour le moment. Soyez le premier à publier !</p>';
    return;
  }

  const featured = [...PROPERTIES_DATA].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
  container.innerHTML = featured.map(createPropertyCard).join('');
}

// ============================================
// All Properties (properties.html)
// ============================================
async function displayAllProperties(properties = null) {
  const container = document.getElementById('propertiesList');
  if (!container) return;

  if (!properties) {
    await loadProperties();
    properties = PROPERTIES_DATA;
  }

  if (properties.length === 0) {
    container.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;color:#888;">Aucune annonce disponible.</p>';
  } else {
    container.innerHTML = properties.map(createPropertyCard).join('');
  }

  const countEl = document.getElementById('resultsCount');
  if (countEl) {
    countEl.textContent = `${properties.length} propriété${properties.length > 1 ? 's' : ''} trouvée${properties.length > 1 ? 's' : ''}`;
  }
}

function updatePriceLabel(value) {
  document.getElementById('priceLabel').textContent = value + ' \u20AC';
}

function applyFilters() {
  const location = document.getElementById('filterLocation')?.value || '';
  const maxPrice = parseInt(document.getElementById('filterPrice')?.value || 500);
  const minBedrooms = parseInt(document.getElementById('filterBedrooms')?.value || 0);
  const minGuests = parseInt(document.getElementById('filterGuests')?.value || 0);
  const sortBy = document.getElementById('sortBy')?.value || 'default';
  const requiredAmenities = getActiveAmenities();

  let filtered = PROPERTIES_DATA.filter(p => {
    if (location && p.location !== location) return false;
    if (p.pricePerNight > maxPrice) return false;
    if (p.bedrooms < minBedrooms) return false;
    if (p.guests < minGuests) return false;
    // Check all required amenities are present
    if (requiredAmenities.length > 0) {
      const propAmenities = p.amenities || [];
      for (const req of requiredAmenities) {
        if (!propAmenities.includes(req)) return false;
      }
    }
    return true;
  });

  switch (sortBy) {
    case 'price-asc': filtered.sort((a, b) => a.pricePerNight - b.pricePerNight); break;
    case 'price-desc': filtered.sort((a, b) => b.pricePerNight - a.pricePerNight); break;
    case 'rating': filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
  }

  displayAllProperties(filtered);
}

// ============================================
// Filter Chips (Booking.com style)
// ============================================
function toggleChip(el) {
  el.classList.toggle('active');
  applyFilters();
}

function getActiveAmenities() {
  const chips = document.querySelectorAll('.filter-chip.active');
  return Array.from(chips).map(c => c.dataset.amenity);
}

// ============================================
// Search
// ============================================
function searchProperties() {
  const location = document.getElementById('searchLocation')?.value || '';
  const checkin = document.getElementById('searchCheckin')?.value || '';
  const checkout = document.getElementById('searchCheckout')?.value || '';
  const guests = document.getElementById('searchGuests')?.value || '';
  const params = new URLSearchParams();
  if (location) params.set('location', location);
  if (checkin) params.set('checkin', checkin);
  if (checkout) params.set('checkout', checkout);
  if (guests) params.set('guests', guests);
  window.location.href = `properties.html?${params.toString()}`;
}

function filterByLocation(location) {
  window.location.href = `properties.html?location=${encodeURIComponent(location)}`;
}

// ============================================
// Property Detail Page
// ============================================
let selectedCheckIn = null;
let selectedCheckOut = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentProperty = null;
let bookedRanges = [];

async function displayPropertyDetail(id) {
  try {
    const res = await fetch(API_URL + '/properties/' + id);
    if (!res.ok) throw new Error('Propriété non trouvée');
    currentProperty = await res.json();
  } catch (err) {
    document.getElementById('propertyDetail').innerHTML = '<p style="text-align:center;padding:60px;">Propriété non trouvée</p>';
    return;
  }

  // Load booked dates from API
  try {
    const bRes = await fetch(API_URL + '/bookings/property/' + id);
    const bookings = await bRes.json();
    bookedRanges = bookings.map(b => ({
      start: b.checkInDate.split('T')[0],
      end: b.checkOutDate.split('T')[0]
    }));
  } catch (err) {
    bookedRanges = [];
  }

  const property = currentProperty;
  document.title = `${property.title} - MaisonSeason`;

  const image0 = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
  const image1 = property.images?.[1] || image0;
  const image2 = property.images?.[2] || image0;
  const image3 = property.images?.[3] || image0;

  const imagesHtml = `<div class="gallery-grid">
    <img class="main-img" src="${image0}" alt="${property.title}">
    <img src="${image1}" alt="">
    <img src="${image2}" alt="">
    <img src="${image3}" alt="">
  </div>`;

  const amenitiesHtml = (property.amenities || [])
    .map(a => `<div class="amenity-tag"><i class="${getAmenityIcon(a)}"></i> ${a}</div>`)
    .join('');

  const reviewsHtml = (property.reviews || [])
    .map(r => `
      <div class="review-item">
        <div class="review-header">
          <div class="review-author">
            <div class="review-avatar">${r.user.split(' ').map(n => n[0]).join('')}</div>
            <div>
              <strong>${r.user}</strong>
              <div class="stars" style="font-size:0.8rem">${generateStars(r.rating)}</div>
            </div>
          </div>
          <span class="review-date">${formatDate(r.date)}</span>
        </div>
        <p class="review-text">${r.comment}</p>
      </div>
    `).join('');

  const ownerName = property.owner ? (property.owner.firstName + ' ' + property.owner.lastName) : 'Propriétaire';
  const ownerId = property.owner?._id || property.owner;
  const ownerInitials = property.owner ? (property.owner.firstName[0] + property.owner.lastName[0]) : 'P';

  // Load host profile
  let hostProfile = null;
  try {
    const hRes = await fetch(API_URL + '/users/' + ownerId);
    if (hRes.ok) hostProfile = await hRes.json();
  } catch (err) {}

  const hostCardHtml = hostProfile ? `
    <div class="detail-section host-card">
      <h2>Votre hôte</h2>
      <div class="host-profile">
        <div class="host-avatar-lg">
          ${hostProfile.avatar ? `<img src="${hostProfile.avatar}" alt="${hostProfile.firstName}">` : `<span>${hostProfile.firstName[0]}${hostProfile.lastName[0]}</span>`}
        </div>
        <div class="host-info">
          <h3>${hostProfile.firstName} ${hostProfile.lastName}</h3>
          ${hostProfile.bio ? `<p class="host-bio">${hostProfile.bio}</p>` : ''}
          <div class="host-meta">
            <span><i class="fas fa-calendar-alt"></i> Membre depuis ${new Date(hostProfile.createdAt).toLocaleDateString('fr-FR', {month:'long', year:'numeric'})}</span>
            ${hostProfile.phone ? `<span><i class="fas fa-phone"></i> ${hostProfile.phone}</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  ` : '';

  document.getElementById('propertyDetail').innerHTML = `
    ${imagesHtml}
    <div class="detail-grid">
      <div class="info-section">
        <h1>${property.title}</h1>
        <div class="info-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${property.address || property.location}</span>
          <span><i class="fas fa-bed"></i> ${property.bedrooms} chambres</span>
          <span><i class="fas fa-bath"></i> ${property.bathrooms} salles de bain</span>
          <span><i class="fas fa-users"></i> ${property.guests} voyageurs</span>
          <span><i class="fas fa-user"></i> Hôte: ${ownerName}</span>
        </div>

        <div class="detail-section">
          <h2>Description</h2>
          <p>${property.description}</p>
        </div>

        ${hostCardHtml}

        ${amenitiesHtml ? `<div class="detail-section"><h2>Équipements</h2><div class="amenities-list">${amenitiesHtml}</div></div>` : ''}

        <div class="detail-section calendar-container">
          <h2>Disponibilités</h2>
          <div class="calendar" id="calendarWidget"></div>
        </div>

        ${reviewsHtml ? `<div class="detail-section detail-reviews"><h2>Avis</h2>${reviewsHtml}</div>` : ''}
      </div>

      <div class="booking-sidebar">
        <div class="price-display">
          <span class="amount">${property.pricePerNight}&euro;</span>
          <span class="per-night">/ nuit</span>
        </div>
        <div class="booking-form">
          <div class="booking-dates">
            <div class="form-group">
              <label>Arrivée</label>
              <input type="date" id="detailCheckin" onchange="updateBookingTotal()">
            </div>
            <div class="form-group">
              <label>Départ</label>
              <input type="date" id="detailCheckout" onchange="updateBookingTotal()">
            </div>
          </div>
          <div class="form-group">
            <label>Voyageurs</label>
            <select id="detailGuests">
              ${Array.from({length: property.guests}, (_, i) =>
                `<option value="${i+1}">${i+1} voyageur${i > 0 ? 's' : ''}</option>`
              ).join('')}
            </select>
          </div>
          <div class="booking-summary" id="bookingSummarySection" style="display:none">
            <div class="booking-summary-row"><span id="nightsLabel">0 nuits</span><span id="nightsPrice">0&euro;</span></div>
            <div class="booking-summary-row"><span>Frais de ménage</span><span>50&euro;</span></div>
            <div class="booking-summary-row"><span>Frais de service</span><span id="serviceFee">0&euro;</span></div>
            <div class="booking-summary-row total"><span>Total</span><span id="totalPrice">0&euro;</span></div>
          </div>
          <button class="btn btn-primary" onclick="handleBooking()" style="width:100%;justify-content:center;padding:14px;margin-top:15px;">
            <i class="fas fa-calendar-check"></i> Réserver
          </button>
        </div>
      </div>
    </div>
  `;

  renderCalendar();
  const today = new Date().toISOString().split('T')[0];
  const checkinEl = document.getElementById('detailCheckin');
  const checkoutEl = document.getElementById('detailCheckout');
  if (checkinEl) checkinEl.min = today;
  if (checkoutEl) checkoutEl.min = today;
}

function getAmenityIcon(amenity) {
  const icons = {
    'WiFi': 'fas fa-wifi', 'Piscine': 'fas fa-swimming-pool', 'Parking': 'fas fa-parking',
    'Climatisation': 'fas fa-snowflake', 'Cuisine équipée': 'fas fa-utensils', 'Lave-linge': 'fas fa-tshirt',
    'Jardin': 'fas fa-leaf', 'Terrasse': 'fas fa-sun', 'BBQ': 'fas fa-fire',
    'Vue mer': 'fas fa-water', 'Animaux acceptés': 'fas fa-paw', 'Cheminée': 'fas fa-fire-alt',
    'Vue montagne': 'fas fa-mountain'
  };
  return icons[amenity] || 'fas fa-check';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ============================================
// Calendar
// ============================================
function renderCalendar() {
  const container = document.getElementById('calendarWidget');
  if (!container || !currentProperty) return;

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7;
  const today = new Date(); today.setHours(0, 0, 0, 0);

  let html = `<div class="calendar-header"><h3>${monthNames[currentMonth]} ${currentYear}</h3><div class="calendar-nav"><button onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button><button onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button></div></div><div class="calendar-grid">`;
  dayNames.forEach(d => { html += `<div class="calendar-day-name">${d}</div>`; });
  for (let i = 0; i < startDay; i++) html += `<div class="calendar-day empty"></div>`;

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    let classes = 'calendar-day';
    const isPast = date < today;
    const isBooked = isDateBooked(dateStr);
    if (isPast) classes += ' disabled';
    else if (isBooked) classes += ' booked';
    if (date.getTime() === today.getTime()) classes += ' today';
    if (selectedCheckIn && dateStr === selectedCheckIn) classes += ' selected';
    if (selectedCheckOut && dateStr === selectedCheckOut) classes += ' selected';
    if (selectedCheckIn && selectedCheckOut && dateStr > selectedCheckIn && dateStr < selectedCheckOut) classes += ' in-range';
    const click = (!isPast && !isBooked) ? `onclick="selectCalendarDate('${dateStr}')"` : '';
    html += `<div class="${classes}" ${click}>${day}</div>`;
  }

  html += `</div><div class="calendar-legend"><span><div class="legend-dot available"></div> Disponible</span><span><div class="legend-dot booked"></div> Réservé</span><span><div class="legend-dot selected"></div> Sélection</span></div>`;
  container.innerHTML = html;
}

function isDateBooked(dateStr) {
  return bookedRanges.some(range => dateStr >= range.start && dateStr <= range.end);
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  else if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
    selectedCheckIn = dateStr; selectedCheckOut = null;
    document.getElementById('detailCheckin').value = dateStr;
    document.getElementById('detailCheckout').value = '';
  } else {
    if (dateStr <= selectedCheckIn) {
      selectedCheckIn = dateStr;
      document.getElementById('detailCheckin').value = dateStr;
    } else {
      const hasBookedInRange = bookedRanges.some(range =>
        (range.start > selectedCheckIn && range.start < dateStr) || (range.end > selectedCheckIn && range.end < dateStr)
      );
      if (hasBookedInRange) { showToast('Des dates dans cette plage sont déjà réservées', 'error'); return; }
      selectedCheckOut = dateStr;
      document.getElementById('detailCheckout').value = dateStr;
    }
  }
  renderCalendar();
  updateBookingTotal();
}

// ============================================
// Booking
// ============================================
function updateBookingTotal() {
  const checkin = document.getElementById('detailCheckin')?.value;
  const checkout = document.getElementById('detailCheckout')?.value;
  const summarySection = document.getElementById('bookingSummarySection');
  if (!checkin || !checkout || !currentProperty) { if (summarySection) summarySection.style.display = 'none'; return; }
  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) { if (summarySection) summarySection.style.display = 'none'; return; }
  const nightsTotal = nights * currentProperty.pricePerNight;
  const serviceFee = Math.round(nightsTotal * 0.05);
  const total = nightsTotal + 50 + serviceFee;
  if (summarySection) summarySection.style.display = 'block';
  document.getElementById('nightsLabel').textContent = `${nights} nuit${nights > 1 ? 's' : ''} x ${currentProperty.pricePerNight}\u20AC`;
  document.getElementById('nightsPrice').textContent = `${nightsTotal}\u20AC`;
  document.getElementById('serviceFee').textContent = `${serviceFee}\u20AC`;
  document.getElementById('totalPrice').textContent = `${total}\u20AC`;
  selectedCheckIn = checkin; selectedCheckOut = checkout; renderCalendar();
}

function handleBooking() {
  if (!getToken()) { showToast('Connectez-vous pour réserver', 'error'); openModal('loginModal'); return; }
  const checkin = document.getElementById('detailCheckin')?.value;
  const checkout = document.getElementById('detailCheckout')?.value;
  if (!checkin || !checkout) { showToast('Veuillez sélectionner vos dates', 'error'); return; }
  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) { showToast('La date de départ doit être après l\'arrivée', 'error'); return; }
  const nightsTotal = nights * currentProperty.pricePerNight;
  const total = nightsTotal + 50 + Math.round(nightsTotal * 0.05);
  const guests = document.getElementById('detailGuests')?.value;

  const summary = document.getElementById('bookingSummary');
  if (summary) {
    summary.innerHTML = `
      <div style="margin-bottom:15px"><strong>${currentProperty.title}</strong><br><span style="color:#888">${currentProperty.address || currentProperty.location}</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:15px">
        <div><strong>Arrivée:</strong> ${formatDate(checkin)}</div>
        <div><strong>Départ:</strong> ${formatDate(checkout)}</div>
        <div><strong>Voyageurs:</strong> ${guests}</div>
        <div><strong>Nuits:</strong> ${nights}</div>
      </div>`;
  }
  const bookingTotal = document.getElementById('bookingTotal');
  if (bookingTotal) bookingTotal.innerHTML = `Total: <strong>${total}&euro;</strong>`;
  openModal('bookingModal');
}

async function confirmBooking(event) {
  event.preventDefault();
  const checkin = document.getElementById('detailCheckin')?.value;
  const checkout = document.getElementById('detailCheckout')?.value;
  const guests = parseInt(document.getElementById('detailGuests')?.value || 1);
  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  const nightsTotal = nights * currentProperty.pricePerNight;
  const total = nightsTotal + 50 + Math.round(nightsTotal * 0.05);

  try {
    const res = await fetch(API_URL + '/bookings', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        property: currentProperty._id,
        checkInDate: checkin,
        checkOutDate: checkout,
        numberOfGuests: guests,
        totalPrice: total,
        specialRequests: document.getElementById('specialRequests')?.value || ''
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    closeModal('bookingModal');
    showToast('Réservation confirmée !');
    document.getElementById('detailCheckin').value = '';
    document.getElementById('detailCheckout').value = '';
    selectedCheckIn = null; selectedCheckOut = null;
    document.getElementById('bookingSummarySection').style.display = 'none';
    // Refresh booked dates
    const bRes = await fetch(API_URL + '/bookings/property/' + currentProperty._id);
    const bookings = await bRes.json();
    bookedRanges = bookings.map(b => ({ start: b.checkInDate.split('T')[0], end: b.checkOutDate.split('T')[0] }));
    renderCalendar();
  } catch (err) {
    showToast(err.message || 'Erreur de réservation', 'error');
  }
}

// ============================================
// Dashboard (Espace Propriétaire)
// ============================================
async function loadDashboard() {
  const user = getUser();
  if (!user) { window.location.href = 'index.html'; return; }

  // Load my properties
  let myProperties = [];
  try {
    const res = await fetch(API_URL + '/properties/mine', { headers: authHeaders() });
    myProperties = await res.json();
  } catch (err) { myProperties = []; }

  // Load my bookings
  let myBookings = [];
  try {
    const res = await fetch(API_URL + '/bookings/mine', { headers: authHeaders() });
    myBookings = await res.json();
  } catch (err) { myBookings = []; }

  // Stats
  const totalProps = document.getElementById('totalProperties');
  const totalBook = document.getElementById('totalBookings');
  const totalRev = document.getElementById('totalRevenue');
  const avgRat = document.getElementById('avgRating');
  if (totalProps) totalProps.textContent = myProperties.length;
  if (totalBook) totalBook.textContent = myBookings.length;
  if (totalRev) {
    const revenue = myBookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    totalRev.textContent = revenue.toLocaleString('fr-FR') + ' \u20AC';
  }
  if (avgRat) {
    const ratings = myProperties.filter(p => p.rating > 0);
    avgRat.textContent = ratings.length > 0 ? (ratings.reduce((sum, p) => sum + p.rating, 0) / ratings.length).toFixed(1) : '-';
  }

  // My Properties list
  const propsList = document.getElementById('myPropertiesList');
  if (propsList) {
    if (myProperties.length === 0) {
      propsList.innerHTML = '<p style="text-align:center;padding:40px;color:#888;">Vous n\'avez pas encore d\'annonce. Créez votre première annonce !</p>';
    } else {
      propsList.innerHTML = myProperties.map(p => {
        const img = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800';
        return `
          <div class="my-property-item">
            <img src="${img}" alt="${p.title}">
            <div class="my-property-info">
              <h3>${p.title}</h3>
              <p><i class="fas fa-map-marker-alt"></i> ${p.address || p.location} &middot; ${p.pricePerNight}&euro;/nuit</p>
            </div>
            <div class="my-property-actions">
              <button class="btn-edit" onclick="window.location.href='property.html?id=${p._id}'"><i class="fas fa-eye"></i> Voir</button>
              <button class="btn-delete" onclick="deleteProperty('${p._id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>`;
      }).join('');
    }
  }

  // Bookings table
  const bookingsBody = document.getElementById('bookingsTableBody');
  if (bookingsBody) {
    if (myBookings.length === 0) {
      bookingsBody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#888;">Aucune réservation</td></tr>';
    } else {
      bookingsBody.innerHTML = myBookings.map(b => {
        const statusLabels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' };
        const guestName = b.guest ? (b.guest.firstName + ' ' + b.guest.lastName) : 'Voyageur';
        const propTitle = b.property ? b.property.title : 'Propriété';
        return `<tr>
          <td>${propTitle}</td>
          <td>${guestName}</td>
          <td>${formatDate(b.checkInDate)}</td>
          <td>${formatDate(b.checkOutDate)}</td>
          <td><strong>${(b.totalPrice || 0).toLocaleString('fr-FR')}&euro;</strong></td>
          <td><span class="status-badge ${b.status}">${statusLabels[b.status] || b.status}</span></td>
          <td>${b.status === 'pending' ? `<button class="btn-edit btn-sm" onclick="updateBookingStatus('${b._id}','confirmed')"><i class="fas fa-check"></i></button><button class="btn-delete btn-sm" onclick="updateBookingStatus('${b._id}','cancelled')"><i class="fas fa-times"></i></button>` : ''}</td>
        </tr>`;
      }).join('');
    }
  }
}

async function deleteProperty(id) {
  if (!confirm('Supprimer cette annonce ?')) return;
  try {
    const res = await fetch(API_URL + '/properties/' + id, { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) throw new Error('Erreur suppression');
    showToast('Annonce supprimée');
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateBookingStatus(id, status) {
  try {
    const res = await fetch(API_URL + '/bookings/' + id, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Erreur');
    showToast(status === 'confirmed' ? 'Réservation confirmée' : 'Réservation annulée');
    loadDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId)?.classList.add('active');
  event.target.classList.add('active');
}

async function handleAddProperty(event) {
  event.preventDefault();
  const amenities = [];
  document.querySelectorAll('.amenities-checkboxes input:checked').forEach(cb => amenities.push(cb.value));

  const imagesRaw = document.getElementById('propImages').value.trim();
  const images = imagesRaw ? imagesRaw.split('\n').map(u => u.trim()).filter(u => u) : [];

  const body = {
    title: document.getElementById('propTitle').value,
    description: document.getElementById('propDescription').value,
    location: document.getElementById('propLocation').value,
    address: document.getElementById('propAddress')?.value || document.getElementById('propLocation').value,
    pricePerNight: parseInt(document.getElementById('propPrice').value),
    price: parseInt(document.getElementById('propPrice').value),
    bedrooms: parseInt(document.getElementById('propBedrooms').value),
    bathrooms: parseInt(document.getElementById('propBathrooms').value),
    guests: parseInt(document.getElementById('propGuests').value),
    amenities,
    images
  };

  try {
    const res = await fetch(API_URL + '/properties', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    showToast('Annonce publiée avec succès !');
    event.target.reset();

    // Switch to properties tab
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('myProperties')?.classList.add('active');
    document.querySelector('.tab-btn')?.classList.add('active');
    loadDashboard();
  } catch (err) {
    showToast(err.message || 'Erreur lors de la publication', 'error');
  }
}

// ============================================
// Profile Editing
// ============================================
function openProfileModal() {
  closeModal('userMenuModal');
  const user = getUser();
  if (!user) return;

  document.getElementById('profileFirstName').value = user.firstName || '';
  document.getElementById('profileLastName').value = user.lastName || '';
  document.getElementById('profilePhone').value = user.phone || '';
  document.getElementById('profileBio').value = user.bio || '';
  document.getElementById('profileAvatar').value = user.avatar || '';

  const preview = document.getElementById('profileAvatarPreview');
  if (preview) {
    if (user.avatar) {
      preview.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
    } else {
      preview.innerHTML = `<span>${user.firstName[0]}${user.lastName[0]}</span>`;
    }
  }

  setTimeout(() => openModal('profileModal'), 200);
}

async function handleProfileUpdate(event) {
  event.preventDefault();
  const body = {
    firstName: document.getElementById('profileFirstName').value,
    lastName: document.getElementById('profileLastName').value,
    phone: document.getElementById('profilePhone').value,
    bio: document.getElementById('profileBio').value,
    avatar: document.getElementById('profileAvatar').value
  };

  try {
    const res = await fetch(API_URL + '/users/me', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // Update local storage
    const user = getUser();
    Object.assign(user, data);
    localStorage.setItem('user', JSON.stringify(user));

    closeModal('profileModal');
    showToast('Profil mis à jour !');
    updateNavbar();
  } catch (err) {
    showToast(err.message || 'Erreur de mise à jour', 'error');
  }
}

function onAvatarInput() {
  const url = document.getElementById('profileAvatar').value;
  const preview = document.getElementById('profileAvatarPreview');
  const user = getUser();
  if (url) {
    preview.innerHTML = `<img src="${url}" alt="Avatar" onerror="this.parentElement.innerHTML='<span>${user.firstName[0]}${user.lastName[0]}</span>'">`;
  } else {
    preview.innerHTML = `<span>${user.firstName[0]}${user.lastName[0]}</span>`;
  }
}

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  displayFeaturedProperties();
});
