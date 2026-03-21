const reservationsList = document.getElementById("reservationsList");
const reservationsWelcome = document.getElementById("reservationsWelcome");

const savedUser = window.RoseApi.getSessionUser();

if (savedUser && reservationsWelcome) {
  reservationsWelcome.textContent = `Hello ${savedUser.name}, here are your saved bookings.`;
} else if (reservationsWelcome) {
  reservationsWelcome.textContent = "Please login to view your bookings.";
}

async function renderBookings() {
  if (!reservationsList) {
    return;
  }

  if (!savedUser) {
    reservationsList.innerHTML = `
      <div class="empty">
        <h3>Authentication required</h3>
        <p>Log in to access your bookings.</p>
      </div>
    `;
    return;
  }

  reservationsList.innerHTML = "";

  try {
    const bookings = await window.RoseApi.request("/api/bookings/mine");

    if (bookings.length === 0) {
      reservationsList.innerHTML = `
        <div class="empty">
          <h3>No bookings</h3>
          <p>Go to a property page to make a booking.</p>
        </div>
      `;
      return;
    }

    bookings.forEach((booking) => {
      const card = document.createElement("div");
      card.className = "reservation-card";

      card.innerHTML = `
        <img src="${booking.image}" alt="${booking.propertyTitle}" class="reservation-image">
        <div class="reservation-body">
          <p class="location">${booking.city}, ${booking.country}</p>
          <h3>${booking.propertyTitle}</h3>
          <p class="meta">
            From ${booking.checkin} to ${booking.checkout} · ${booking.nights} night(s) · ${booking.travellers} traveler(s)
          </p>
          <p>Booked by: ${booking.customerName}</p>
          <div class="price-row">
            <p class="price">${booking.total}€ total</p>
            <button class="btn cancel-booking-btn" data-id="${booking.id}">Cancel</button>
          </div>
        </div>
      `;

      reservationsList.appendChild(card);
    });

    document.querySelectorAll(".cancel-booking-btn").forEach((button) => {
      button.addEventListener("click", async function () {
        try {
          await window.RoseApi.request(`/api/bookings/${Number(this.dataset.id)}`, {
            method: "DELETE"
          });
          await renderBookings();
        } catch (error) {
          alert(error.message);
        }
      });
    });
  } catch (error) {
    reservationsList.innerHTML = `
      <div class="empty">
        <h3>Unable to load bookings</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

renderBookings();
