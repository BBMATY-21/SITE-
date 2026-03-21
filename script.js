const cardsContainer = document.getElementById("cardsContainer");
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const guestInput = document.getElementById("guestInput");
const welcomeUser = document.getElementById("welcomeUser");

const savedUser = window.RoseApi.getSessionUser();
let allProperties = [];

if (welcomeUser && savedUser) {
  welcomeUser.textContent = `Hello ${savedUser.name}, glad to see you back on RoseBooking.`;
}

function displayProperties(list) {
  cardsContainer.innerHTML = "";

  if (list.length === 0) {
    cardsContainer.innerHTML = `
      <div class="empty">
        <h3>No properties found</h3>
        <p>Try another city or reduce the number of travelers.</p>
      </div>
    `;
    return;
  }

  list.forEach((property) => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${property.image}" alt="${property.title}">
      <div class="card-body">
        <div class="card-top">
          <div>
            <p class="location">${property.city}, ${property.country}</p>
            <h3>${property.title}</h3>
          </div>
          <span class="rating">⭐ ${property.rating}</span>
        </div>

        <p class="meta">${property.guests} travelers · ${property.bedrooms} bedrooms · ${property.bathrooms} bathrooms</p>
        <p>${property.description}</p>

        <div class="price-row">
          <p class="price">${property.price}€ / night</p>
          <a class="btn link-btn" href="property.html?id=${property.id}">View property</a>
        </div>
      </div>
    `;

    cardsContainer.appendChild(card);
  });
}

async function loadProperties() {
  try {
    allProperties = await window.RoseApi.request("/api/properties");
    displayProperties(allProperties);
  } catch (error) {
    cardsContainer.innerHTML = `
      <div class="empty">
        <h3>Unable to load properties</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const cityValue = cityInput.value.toLowerCase().trim();
  const guestValue = Number(guestInput.value || 0);

  const filtered = allProperties.filter((property) => {
    const matchCity = cityValue ? property.city.toLowerCase().includes(cityValue) : true;
    const matchGuests = guestValue ? property.guests >= guestValue : true;
    return matchCity && matchGuests;
  });

  displayProperties(filtered);
});

loadProperties();
