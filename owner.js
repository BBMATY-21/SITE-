const ownerForm = document.getElementById("ownerForm");
const ownerMessage = document.getElementById("ownerMessage");
const ownerPropertiesList = document.getElementById("ownerPropertiesList");
const ownerPropertyCount = document.getElementById("ownerPropertyCount");
const ownerBookingCount = document.getElementById("ownerBookingCount");
const ownerBookingsList = document.getElementById("ownerBookingsList");
const ownerWelcome = document.getElementById("ownerWelcome");
const ownerGrid = document.querySelector(".owner-grid");

const savedUser = window.RoseApi.getSessionUser();

function renderProtectedMessage() {
  ownerGrid.innerHTML = `
    <div class="empty owner-locked">
      <h3>Owner space is protected</h3>
      <p>You must be logged in with an owner account to access this page.</p>
      <a class="btn link-btn" href="login.html">Go to login</a>
    </div>
  `;

  if (ownerWelcome) {
    ownerWelcome.textContent = "Access denied: owner account required.";
  }
}

if (!savedUser || savedUser.role !== "owner") {
  renderProtectedMessage();
} else {
  ownerWelcome.textContent = `Hello ${savedUser.name}, add and manage your properties here.`;

  async function renderOwnerProperties() {
    try {
      const properties = await window.RoseApi.request("/api/properties");
      const myProperties = properties.filter((property) => property.ownerEmail === savedUser.email);

      ownerPropertyCount.textContent = myProperties.length;
      ownerPropertiesList.innerHTML = "";

      if (myProperties.length === 0) {
        ownerPropertiesList.innerHTML = `
          <div class="empty">
            <h3>No properties added</h3>
            <p>Add your first property using the form.</p>
          </div>
        `;
        return;
      }

      myProperties.forEach((property) => {
        const card = document.createElement("div");
        card.className = "owner-property-card";

        card.innerHTML = `
          <img src="${property.image}" alt="${property.title}" class="owner-property-image">
          <div class="owner-property-body">
            <p class="location">${property.city}, ${property.country}</p>
            <h3>${property.title}</h3>
            <p class="meta">${property.guests} travelers · ${property.bedrooms} bedrooms · ${property.bathrooms} bathrooms</p>
            <p>${property.description}</p>
            <div class="price-row">
              <p class="price">${property.price}€ / night</p>
              <button class="btn delete-btn" data-id="${property.id}">Delete</button>
            </div>
          </div>
        `;

        ownerPropertiesList.appendChild(card);
      });

      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", async function () {
          try {
            await window.RoseApi.request(`/api/properties/${Number(this.dataset.id)}`, {
              method: "DELETE"
            });
            await renderOwnerProperties();
            await renderIncomingBookings();
          } catch (error) {
            ownerMessage.textContent = error.message;
          }
        });
      });
    } catch (error) {
      ownerPropertiesList.innerHTML = `
        <div class="empty">
          <h3>Unable to load properties</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  async function renderIncomingBookings() {
    try {
      const incomingBookings = await window.RoseApi.request("/api/bookings/incoming");
      ownerBookingCount.textContent = incomingBookings.length;
      ownerBookingsList.innerHTML = "";

      if (incomingBookings.length === 0) {
        ownerBookingsList.innerHTML = `
          <div class="empty">
            <h3>No incoming bookings yet</h3>
            <p>Your reservations from travelers will appear here.</p>
          </div>
        `;
        return;
      }

      incomingBookings.forEach((booking) => {
        const card = document.createElement("div");
        card.className = "owner-booking-card";

        card.innerHTML = `
          <img src="${booking.image}" alt="${booking.propertyTitle}" class="owner-booking-image">
          <div class="owner-booking-body">
            <p class="location">${booking.city}, ${booking.country}</p>
            <h3>${booking.propertyTitle}</h3>
            <p class="meta">From ${booking.checkin} to ${booking.checkout} · ${booking.nights} night(s) · ${booking.travellers} traveler(s)</p>
            <p>Guest: ${booking.customerName}</p>
            <div class="price-row">
              <p class="price">${booking.total}€ total</p>
            </div>
          </div>
        `;

        ownerBookingsList.appendChild(card);
      });
    } catch (error) {
      ownerBookingsList.innerHTML = `
        <div class="empty">
          <h3>Unable to load incoming bookings</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  ownerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const body = {
      title: document.getElementById("title").value.trim(),
      city: document.getElementById("city").value.trim(),
      country: document.getElementById("country").value.trim(),
      price: Number(document.getElementById("price").value),
      guests: Number(document.getElementById("guests").value),
      bedrooms: Number(document.getElementById("bedrooms").value),
      bathrooms: Number(document.getElementById("bathrooms").value),
      image: document.getElementById("image").value.trim(),
      description: document.getElementById("description").value.trim(),
      amenities: document.getElementById("amenities").value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "")
    };

    try {
      await window.RoseApi.request("/api/properties", {
        method: "POST",
        body
      });

      ownerMessage.textContent = `The property "${body.title}" has been added.`;
      ownerForm.reset();
      await renderOwnerProperties();
      await renderIncomingBookings();
    } catch (error) {
      ownerMessage.textContent = error.message;
    }
  });

  renderOwnerProperties();
  renderIncomingBookings();
}
