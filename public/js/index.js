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
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (dataForm) {
  dataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "Data");
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
