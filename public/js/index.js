import displayMap from "./mapbox";
import login, { logout } from "./log";
import { updateData } from "./updateSettings";

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".login--form");
const dataForm = document.querySelector(".form-user-data");
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

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

if (dataForm) {
  dataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newEmail = document.getElementById("email").value;
    const newName = document.getElementById("name").value;
    updateData(newEmail, newName);
  });
}
