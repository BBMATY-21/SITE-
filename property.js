const propertyDetails = document.getElementById("propertyDetails");
const params = new URLSearchParams(window.location.search);
const propertyId = Number(params.get("id"));

function calculateNights(checkin, checkout) {
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diff = end - start;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function renderProperty(property) {
  propertyDetails.innerHTML = `
    <section class="detail-hero">
      <img src="${property.image}" alt="${property.title}" class="detail-main-image" />
    </section>

    <section class="detail-content">
      <div class="detail-left">
        <p class="tag">${property.city}, ${property.country}</p>
        <h1>${property.title}</h1>
        <p class="detail-rating">⭐ ${property.rating}</p>

        <p class="meta">${property.guests} travelers · ${property.bedrooms} bedrooms · ${property.bathrooms} bathrooms</p>

        <div class="detail-box">
          <h2>Description</h2>
          <p>${property.description}</p>
        </div>

        <div class="detail-box">
          <h2>Amenities</h2>
          <div class="amenities-list">
            ${property.amenities.map((item) => `<span class="amenity-item">${item}</span>`).join("")}
          </div>
        </div>
      </div>

      <aside class="booking-panel">
        <p class="booking-price"><strong>${property.price}€</strong> / night</p>
        <form id="bookingForm" class="booking-form">
          <label>
            Check-in
            <input type="date" id="checkin" required />
          </label>

          <label>
            Check-out
            <input type="date" id="checkout" required />
          </label>

          <label>
            Travelers
            <input type="number" id="travellers" min="1" max="${property.guests}" value="2" required />
          </label>

          <button type="submit" class="btn booking-btn">Book</button>
        </form>

        <p id="bookingMessage" class="booking-message"></p>
      </aside>
    </section>
  `;

  const bookingForm = document.getElementById("bookingForm");
  const bookingMessage = document.getElementById("bookingMessage");

  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const sessionUser = window.RoseApi.getSessionUser();
    if (!sessionUser) {
      bookingMessage.textContent = "Please login before booking.";
      return;
    }

    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;
    const travellers = Number(document.getElementById("travellers").value);

    if (!checkin || !checkout) {
      bookingMessage.textContent = "Please fill in the dates.";
      return;
    }

    const nights = calculateNights(checkin, checkout);
    if (nights <= 0) {
      bookingMessage.textContent = "Check-out date must be after check-in date.";
      return;
    }

    try {
      const booking = await window.RoseApi.request("/api/bookings", {
        method: "POST",
        body: {
          propertyId: property.id,
          checkin,
          checkout,
          travellers
        }
      });

      bookingMessage.textContent = `Booking saved: ${booking.nights} night(s), total ${booking.total}€. `;

      setTimeout(() => {
        window.location.href = "reservations.html";
      }, 1200);
    } catch (error) {
      bookingMessage.textContent = error.message;
    }
  });
}

async function loadProperty() {
  if (!propertyId) {
    propertyDetails.innerHTML = `
      <div class="empty detail-empty">
        <h2>Property not found</h2>
        <p>Invalid property id.</p>
        <a href="index.html" class="btn link-btn">Back to home</a>
      </div>
    `;
    return;
  }

  try {
    const property = await window.RoseApi.request(`/api/properties/${propertyId}`);
    renderProperty(property);
  } catch (error) {
    propertyDetails.innerHTML = `
      <div class="empty detail-empty">
        <h2>Property not found</h2>
        <p>${error.message}</p>
        <a href="index.html" class="btn link-btn">Back to home</a>
      </div>
    `;
  }
}

loadProperty();
