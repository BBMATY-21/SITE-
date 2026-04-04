// ============================================
// MaisonSeason - Application JavaScript
// ============================================

const API_URL = '/api';

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
  document.getElementById(id).classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function switchModal(from, to) {
  closeModal(from);
  setTimeout(() => openModal(to), 200);
}

// Close modal on outside click
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
// Property Card HTML
// ============================================
function createPropertyCard(property) {
  const starsHtml = generateStars(property.rating);
  const badgeHtml = property.badge
    ? `<span class="property-badge">${property.badge}</span>`
    : '';

  return `
    <div class="property-card" onclick="window.location.href='property.html?id=${property.id}'">
      <div class="property-card-image">
        ${badgeHtml}
        <button class="property-favorite" onclick="event.stopPropagation(); toggleFavorite(${property.id}, this)">
          <i class="far fa-heart"></i>
        </button>
        <img src="${property.images[0]}" alt="${property.title}" loading="lazy">
      </div>
      <div class="property-card-body">
        <div class="property-location">
          <i class="fas fa-map-marker-alt"></i> ${property.address}
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
            <strong>${property.rating}</strong>
            <span class="rating-count">(${property.reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<i class="fas fa-star"></i>';
    } else if (i - rating < 1) {
      html += '<i class="fas fa-star-half-alt"></i>';
    } else {
      html += '<i class="far fa-star"></i>';
    }
  }
  return html;
}

// ============================================
// Featured Properties (index.html)
// ============================================
function displayFeaturedProperties() {
  const container = document.getElementById('featuredProperties');
  if (!container) return;

  const featured = PROPERTIES_DATA
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  container.innerHTML = featured.map(createPropertyCard).join('');
}

// ============================================
// All Properties (properties.html)
// ============================================
function displayAllProperties(properties = null) {
  const container = document.getElementById('propertiesList');
  if (!container) return;

  const data = properties || PROPERTIES_DATA;
  container.innerHTML = data.map(createPropertyCard).join('');

  const countEl = document.getElementById('resultsCount');
  if (countEl) {
    countEl.textContent = `${data.length} propriété${data.length > 1 ? 's' : ''} trouvée${data.length > 1 ? 's' : ''}`;
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

  let filtered = PROPERTIES_DATA.filter(p => {
    if (location && p.location !== location) return false;
    if (p.pricePerNight > maxPrice) return false;
    if (p.bedrooms < minBedrooms) return false;
    if (p.guests < minGuests) return false;
    return true;
  });

  switch (sortBy) {
    case 'price-asc':
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
  }

  displayAllProperties(filtered);
}

// ============================================
// Search from Navbar
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
// Favorites
// ============================================
function toggleFavorite(id, btn) {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  if (btn.classList.contains('active')) {
    icon.className = 'fas fa-heart';
    icon.style.color = '#ef4444';
    showToast('Ajouté aux favoris');
  } else {
    icon.className = 'far fa-heart';
    icon.style.color = '';
    showToast('Retiré des favoris', 'info');
  }
}

// ============================================
// Property Detail Page
// ============================================
let selectedCheckIn = null;
let selectedCheckOut = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let currentProperty = null;

function displayPropertyDetail(id) {
  const property = PROPERTIES_DATA.find(p => p.id === id);
  if (!property) {
    document.getElementById('propertyDetail').innerHTML = '<p style="text-align:center;padding:60px;">Propriété non trouvée</p>';
    return;
  }

  currentProperty = property;
  document.title = `${property.title} - MaisonSeason`;

  const imagesHtml = property.images.length >= 4
    ? `<div class="gallery-grid">
        <img class="main-img" src="${property.images[0]}" alt="${property.title}">
        <img src="${property.images[1]}" alt="">
        <img src="${property.images[2]}" alt="">
        <img src="${property.images[3]}" alt="">
       </div>`
    : `<div class="gallery-grid">
        <img class="main-img" src="${property.images[0]}" alt="${property.title}" style="grid-column: 1/-1; grid-row: 1/-1;">
       </div>`;

  const amenitiesHtml = property.amenities
    .map(a => `<div class="amenity-tag"><i class="${getAmenityIcon(a)}"></i> ${a}</div>`)
    .join('');

  const reviewsHtml = property.reviews
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

  document.getElementById('propertyDetail').innerHTML = `
    ${imagesHtml}

    <div class="detail-grid">
      <div class="info-section">
        <h1>${property.title}</h1>
        <div class="info-meta">
          <span><i class="fas fa-map-marker-alt"></i> ${property.address}</span>
          <span><i class="fas fa-bed"></i> ${property.bedrooms} chambres</span>
          <span><i class="fas fa-bath"></i> ${property.bathrooms} salles de bain</span>
          <span><i class="fas fa-users"></i> ${property.guests} voyageurs</span>
          <span><i class="fas fa-star" style="color: var(--secondary)"></i> ${property.rating} (${property.reviewCount} avis)</span>
        </div>

        <div class="detail-section">
          <h2>Description</h2>
          <p>${property.description}</p>
        </div>

        <div class="detail-section">
          <h2>Equipements</h2>
          <div class="amenities-list">${amenitiesHtml}</div>
        </div>

        <div class="detail-section calendar-container">
          <h2>Disponibilités</h2>
          <div class="calendar" id="calendarWidget"></div>
        </div>

        <div class="detail-section detail-reviews">
          <h2>Avis (${property.reviewCount})</h2>
          ${reviewsHtml}
        </div>
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
            <div class="booking-summary-row">
              <span id="nightsLabel">0 nuits</span>
              <span id="nightsPrice">0&euro;</span>
            </div>
            <div class="booking-summary-row">
              <span>Frais de ménage</span>
              <span>50&euro;</span>
            </div>
            <div class="booking-summary-row">
              <span>Frais de service</span>
              <span id="serviceFee">0&euro;</span>
            </div>
            <div class="booking-summary-row total">
              <span>Total</span>
              <span id="totalPrice">0&euro;</span>
            </div>
          </div>

          <button class="btn btn-primary" onclick="handleBooking()" style="width:100%;justify-content:center;padding:14px;margin-top:15px;">
            <i class="fas fa-calendar-check"></i> Réserver
          </button>
        </div>
      </div>
    </div>
  `;

  renderCalendar();

  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  const checkinEl = document.getElementById('detailCheckin');
  const checkoutEl = document.getElementById('detailCheckout');
  if (checkinEl) checkinEl.min = today;
  if (checkoutEl) checkoutEl.min = today;
}

function getAmenityIcon(amenity) {
  const icons = {
    'WiFi': 'fas fa-wifi',
    'Piscine': 'fas fa-swimming-pool',
    'Parking': 'fas fa-parking',
    'Climatisation': 'fas fa-snowflake',
    'Cuisine équipée': 'fas fa-utensils',
    'Lave-linge': 'fas fa-tshirt',
    'Jardin': 'fas fa-leaf',
    'Terrasse': 'fas fa-sun',
    'BBQ': 'fas fa-fire',
    'Vue mer': 'fas fa-water',
    'Animaux acceptés': 'fas fa-paw',
    'Cheminée': 'fas fa-fire-alt',
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

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let html = `
    <div class="calendar-header">
      <h3>${monthNames[currentMonth]} ${currentYear}</h3>
      <div class="calendar-nav">
        <button onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
        <button onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
    <div class="calendar-grid">
  `;

  dayNames.forEach(d => {
    html += `<div class="calendar-day-name">${d}</div>`;
  });

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    html += `<div class="calendar-day empty"></div>`;
  }

  // Days of month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    let classes = 'calendar-day';

    const isPast = date < today;
    const isBooked = isDateBooked(dateStr);
    const isToday = date.getTime() === today.getTime();

    if (isPast) {
      classes += ' disabled';
    } else if (isBooked) {
      classes += ' booked';
    }

    if (isToday) classes += ' today';

    if (selectedCheckIn && dateStr === selectedCheckIn) classes += ' selected';
    if (selectedCheckOut && dateStr === selectedCheckOut) classes += ' selected';
    if (selectedCheckIn && selectedCheckOut) {
      if (dateStr > selectedCheckIn && dateStr < selectedCheckOut) {
        classes += ' in-range';
      }
    }

    const clickHandler = (!isPast && !isBooked)
      ? `onclick="selectCalendarDate('${dateStr}')"`
      : '';

    html += `<div class="${classes}" ${clickHandler}>${day}</div>`;
  }

  html += `</div>
    <div class="calendar-legend">
      <span><div class="legend-dot available"></div> Disponible</span>
      <span><div class="legend-dot booked"></div> Réservé</span>
      <span><div class="legend-dot selected"></div> Sélection</span>
    </div>
  `;

  container.innerHTML = html;
}

function isDateBooked(dateStr) {
  if (!currentProperty) return false;
  return currentProperty.bookedDates.some(range => {
    return dateStr >= range.start && dateStr <= range.end;
  });
}

function changeMonth(delta) {
  currentMonth += delta;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
}

function selectCalendarDate(dateStr) {
  if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
    selectedCheckIn = dateStr;
    selectedCheckOut = null;
    document.getElementById('detailCheckin').value = dateStr;
    document.getElementById('detailCheckout').value = '';
  } else {
    if (dateStr <= selectedCheckIn) {
      selectedCheckIn = dateStr;
      document.getElementById('detailCheckin').value = dateStr;
    } else {
      // Check no booked dates in range
      const hasBookedInRange = currentProperty.bookedDates.some(range => {
        return (range.start > selectedCheckIn && range.start < dateStr) ||
               (range.end > selectedCheckIn && range.end < dateStr);
      });

      if (hasBookedInRange) {
        showToast('Des dates dans cette plage sont déjà réservées', 'error');
        return;
      }

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

  if (!checkin || !checkout || !currentProperty) {
    if (summarySection) summarySection.style.display = 'none';
    return;
  }

  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) {
    if (summarySection) summarySection.style.display = 'none';
    return;
  }

  const nightsTotal = nights * currentProperty.pricePerNight;
  const cleaningFee = 50;
  const serviceFee = Math.round(nightsTotal * 0.05);
  const total = nightsTotal + cleaningFee + serviceFee;

  if (summarySection) summarySection.style.display = 'block';
  document.getElementById('nightsLabel').textContent = `${nights} nuit${nights > 1 ? 's' : ''} x ${currentProperty.pricePerNight}\u20AC`;
  document.getElementById('nightsPrice').textContent = `${nightsTotal}\u20AC`;
  document.getElementById('serviceFee').textContent = `${serviceFee}\u20AC`;
  document.getElementById('totalPrice').textContent = `${total}\u20AC`;

  // Sync calendar selection
  selectedCheckIn = checkin;
  selectedCheckOut = checkout;
  renderCalendar();
}

function handleBooking() {
  const checkin = document.getElementById('detailCheckin')?.value;
  const checkout = document.getElementById('detailCheckout')?.value;
  const guests = document.getElementById('detailGuests')?.value;

  if (!checkin || !checkout) {
    showToast('Veuillez sélectionner vos dates de séjour', 'error');
    return;
  }

  const nights = Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24));
  if (nights <= 0) {
    showToast('La date de départ doit être après la date d\'arrivée', 'error');
    return;
  }

  const nightsTotal = nights * currentProperty.pricePerNight;
  const serviceFee = Math.round(nightsTotal * 0.05);
  const total = nightsTotal + 50 + serviceFee;

  const summary = document.getElementById('bookingSummary');
  if (summary) {
    summary.innerHTML = `
      <div style="margin-bottom:15px">
        <strong>${currentProperty.title}</strong><br>
        <span style="color: var(--gray-500)">${currentProperty.address}</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px">
        <div><strong>Arrivée:</strong> ${formatDate(checkin)}</div>
        <div><strong>Départ:</strong> ${formatDate(checkout)}</div>
        <div><strong>Voyageurs:</strong> ${guests}</div>
        <div><strong>Nuits:</strong> ${nights}</div>
      </div>
    `;
  }

  const bookingTotal = document.getElementById('bookingTotal');
  if (bookingTotal) {
    bookingTotal.innerHTML = `Total: <strong>${total}&euro;</strong>`;
  }

  openModal('bookingModal');
}

function confirmBooking(event) {
  event.preventDefault();
  closeModal('bookingModal');
  showToast('Réservation confirmée ! Vous recevrez un email de confirmation.');

  // Reset
  document.getElementById('detailCheckin').value = '';
  document.getElementById('detailCheckout').value = '';
  selectedCheckIn = null;
  selectedCheckOut = null;
  document.getElementById('bookingSummarySection').style.display = 'none';
  renderCalendar();
}

// ============================================
// Auth
// ============================================
function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  closeModal('loginModal');
  showToast(`Bienvenue ! Connecté en tant que ${email}`);
}

function handleRegister(event) {
  event.preventDefault();
  const firstName = document.getElementById('regFirstName').value;
  closeModal('registerModal');
  showToast(`Inscription réussie ! Bienvenue ${firstName}`);
}

// ============================================
// Dashboard
// ============================================
function loadDashboard() {
  // Stats
  const totalProps = document.getElementById('totalProperties');
  const totalBook = document.getElementById('totalBookings');
  const totalRev = document.getElementById('totalRevenue');
  const avgRat = document.getElementById('avgRating');

  if (totalProps) totalProps.textContent = PROPERTIES_DATA.length;
  if (totalBook) totalBook.textContent = BOOKINGS_DATA.length;
  if (totalRev) {
    const revenue = BOOKINGS_DATA
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + b.totalPrice, 0);
    totalRev.textContent = revenue.toLocaleString('fr-FR') + ' \u20AC';
  }
  if (avgRat) {
    const avg = PROPERTIES_DATA.reduce((sum, p) => sum + p.rating, 0) / PROPERTIES_DATA.length;
    avgRat.textContent = avg.toFixed(1);
  }

  // My Properties
  const propsList = document.getElementById('myPropertiesList');
  if (propsList) {
    propsList.innerHTML = PROPERTIES_DATA.map(p => `
      <div class="my-property-item">
        <img src="${p.images[0]}" alt="${p.title}">
        <div class="my-property-info">
          <h3>${p.title}</h3>
          <p><i class="fas fa-map-marker-alt"></i> ${p.address} &middot; ${p.pricePerNight}&euro;/nuit &middot; <i class="fas fa-star" style="color:var(--secondary)"></i> ${p.rating}</p>
        </div>
        <div class="my-property-actions">
          <button class="btn-edit" onclick="window.location.href='property.html?id=${p.id}'">
            <i class="fas fa-eye"></i> Voir
          </button>
          <button class="btn-edit" onclick="showToast('Modification en cours...')">
            <i class="fas fa-edit"></i> Modifier
          </button>
          <button class="btn-delete" onclick="showToast('Propriété supprimée', 'error')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Bookings Table
  const bookingsBody = document.getElementById('bookingsTableBody');
  if (bookingsBody) {
    bookingsBody.innerHTML = BOOKINGS_DATA.map(b => {
      const statusLabels = { pending: 'En attente', confirmed: 'Confirmée', cancelled: 'Annulée' };
      return `
        <tr>
          <td>${b.propertyTitle}</td>
          <td>${b.guestName}</td>
          <td>${formatDate(b.checkIn)}</td>
          <td>${formatDate(b.checkOut)}</td>
          <td><strong>${b.totalPrice.toLocaleString('fr-FR')}&euro;</strong></td>
          <td><span class="status-badge ${b.status}">${statusLabels[b.status]}</span></td>
          <td>
            ${b.status === 'pending' ? `
              <button class="btn-edit btn-sm" onclick="showToast('Réservation confirmée')"><i class="fas fa-check"></i></button>
              <button class="btn-delete btn-sm" onclick="showToast('Réservation annulée', 'error')"><i class="fas fa-times"></i></button>
            ` : ''}
          </td>
        </tr>
      `;
    }).join('');
  }
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

  document.getElementById(tabId)?.classList.add('active');
  event.target.classList.add('active');
}

function handleAddProperty(event) {
  event.preventDefault();

  const amenities = [];
  document.querySelectorAll('.amenities-checkboxes input:checked').forEach(cb => {
    amenities.push(cb.value);
  });

  const newProperty = {
    title: document.getElementById('propTitle').value,
    description: document.getElementById('propDescription').value,
    location: document.getElementById('propLocation').value,
    pricePerNight: parseInt(document.getElementById('propPrice').value),
    bedrooms: parseInt(document.getElementById('propBedrooms').value),
    bathrooms: parseInt(document.getElementById('propBathrooms').value),
    guests: parseInt(document.getElementById('propGuests').value),
    amenities
  };

  console.log('Nouvelle propriété:', newProperty);
  showToast('Annonce publiée avec succès !');
  event.target.reset();

  // Switch to properties tab
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('myProperties')?.classList.add('active');
  document.querySelector('.tab-btn')?.classList.add('active');
}

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  displayFeaturedProperties();
});
