const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const registerMessage = document.getElementById("registerMessage");
const loginMessage = document.getElementById("loginMessage");
const accountStatus = document.getElementById("accountStatus");
const logoutBtn = document.getElementById("logoutBtn");

function redirectByRole(role) {
  if (role === "owner") {
    window.location.href = "owner.html";
    return;
  }

  window.location.href = "index.html";
}

const savedUser = window.RoseApi.getSessionUser();
if (savedUser && accountStatus) {
  accountStatus.textContent = `Logged in as ${savedUser.name} (${savedUser.role}).`;
}

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  registerMessage.textContent = "";
  loginMessage.textContent = "";

  const name = document.getElementById("registerName").value.trim();
  const email = document.getElementById("registerEmail").value.trim().toLowerCase();
  const password = document.getElementById("registerPassword").value.trim();
  const role = document.getElementById("registerRole").value;

  try {
    const data = await window.RoseApi.request("/api/auth/register", {
      method: "POST",
      body: { name, email, password, role }
    });

    window.RoseApi.setAuthSession({ user: data.user, token: data.token });
    registerMessage.textContent = `Account created successfully. Welcome ${data.user.name}!`;

    setTimeout(() => {
      redirectByRole(data.user.role);
    }, 900);
  } catch (error) {
    registerMessage.textContent = error.message;
  }
});

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  registerMessage.textContent = "";
  loginMessage.textContent = "";

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const data = await window.RoseApi.request("/api/auth/login", {
      method: "POST",
      body: { email, password }
    });

    window.RoseApi.setAuthSession({ user: data.user, token: data.token });
    loginMessage.textContent = `Login successful. Welcome back ${data.user.name}!`;

    setTimeout(() => {
      redirectByRole(data.user.role);
    }, 900);
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

logoutBtn.addEventListener("click", function () {
  window.RoseApi.clearAuthSession();
  accountStatus.textContent = "You are now logged out.";
  loginMessage.textContent = "Session closed.";
});
