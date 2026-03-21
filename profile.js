const profileMessage = document.getElementById("profileMessage");
const profileContent = document.getElementById("profileContent");

const sessionUser = window.RoseApi.getSessionUser();

async function renderProfile() {
  if (!sessionUser) {
    profileMessage.textContent = "You are not logged in.";
    profileContent.innerHTML = `
      <div class="empty">
        <h3>Authentication required</h3>
        <p>Log in or create an account to access your profile.</p>
        <a href="login.html" class="btn link-btn">Go to authentication</a>
      </div>
    `;
    return;
  }

  try {
    const me = await window.RoseApi.request("/api/me");
    const myBookings = await window.RoseApi.request("/api/bookings/mine");

    let myPublishedProperties = [];
    let myIncomingBookings = [];

    if (me.user.role === "owner") {
      const allProperties = await window.RoseApi.request("/api/properties");
      myPublishedProperties = allProperties.filter((property) => property.ownerEmail === me.user.email);
      myIncomingBookings = await window.RoseApi.request("/api/bookings/incoming");
    }

    profileMessage.textContent = `Welcome ${me.user.name}. Your role is ${me.user.role}.`;

    profileContent.innerHTML = `
      <div class="profile-grid">
        <section class="profile-panel">
          <h2>Identity</h2>
          <p><strong>Name:</strong> ${me.user.name}</p>
          <p><strong>Email:</strong> ${me.user.email}</p>
          <p><strong>Role:</strong> ${me.user.role}</p>
        </section>

        <section class="profile-panel">
          <h2>Activity</h2>
          <p><strong>My bookings:</strong> ${myBookings.length}</p>
          <p><strong>My published properties:</strong> ${myPublishedProperties.length}</p>
          <p><strong>Incoming bookings:</strong> ${myIncomingBookings.length}</p>
        </section>
      </div>

      <div class="profile-actions">
        <a href="reservations.html" class="btn link-btn">View my bookings</a>
        ${me.user.role === "owner" ? '<a href="owner.html" class="btn link-btn">Go to owner space</a>' : '<a href="login.html" class="btn link-btn">Switch account role</a>'}
      </div>
    `;
  } catch (error) {
    profileMessage.textContent = "Unable to load profile.";
    profileContent.innerHTML = `
      <div class="empty">
        <h3>Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

renderProfile();
