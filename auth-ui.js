function applyHeaderAuthState() {
  const sessionUser = window.RoseApi.getSessionUser();

  const ownerLink = document.querySelector("[data-nav-owner]");
  const profileLink = document.querySelector("[data-nav-profile]");
  const loginLink = document.querySelector("[data-nav-login]");
  const logoutButton = document.querySelector("[data-nav-logout]");

  if (ownerLink) {
    if (sessionUser && sessionUser.role === "owner") {
      ownerLink.href = "owner.html";
      ownerLink.textContent = "Owner Space";
    } else {
      ownerLink.href = "login.html";
      ownerLink.textContent = "Owner Access";
    }
  }

  if (profileLink) {
    profileLink.style.display = sessionUser ? "inline" : "none";
  }

  if (loginLink) {
    if (sessionUser) {
      loginLink.href = "profile.html";
      loginLink.textContent = `Hi, ${sessionUser.name}`;
    } else {
      loginLink.href = "login.html";
      loginLink.textContent = "Login";
    }
  }

  if (logoutButton) {
    if (sessionUser) {
      logoutButton.hidden = false;
      logoutButton.addEventListener("click", () => {
        window.RoseApi.clearAuthSession();

        const isOwnerPage = window.location.pathname.endsWith("owner.html");
        if (isOwnerPage) {
          window.location.href = "index.html";
          return;
        }

        window.location.reload();
      });
    } else {
      logoutButton.hidden = true;
    }
  }
}

applyHeaderAuthState();
