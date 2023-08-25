import displayMap from "./mapbox";
import login, { logout } from "./log";
import { updateSettings } from "./updateSettings";

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".login--form");
const dataForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const logoutButton = document.querySelector(".nav__el--logout");

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = loginForm.getElementById("email").value;
    const password = loginForm.getElementById("password").value;
    login(email, password);
  });
}

if (dataForm) {
  dataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newEmail = document.getElementById("email").value;
    const newName = document.getElementById("name").value;
    updateSettings({ email: newEmail, name: newName }, "Data");
  });
}

if (passwordForm) {
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    const saveButton = document.getElementById("save-password");
    saveButton.textContent = "Updating...";
    const didSucceed = await updateSettings(
      { currentPassword, newPassword, confirmPassword },
      "Password"
    );
    saveButton.textContent = "Save password";

    if (didSucceed) {
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}
