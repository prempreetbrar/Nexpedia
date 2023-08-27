import displayMap from "./mapbox";
import login, { logout } from "./log";
import { updateSettings, imageURLPreview } from "./updateSettings";

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".login--form");
const dataForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const logoutButton = document.querySelector(".nav__el--logout");

const upload = document.querySelector("#photo");

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
    if (document.getElementById("photo").files.length > 0)
      form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "Data");
  });
}

if (upload) {
  const originalPhoto = document.querySelector(".form__photo-upload");
  let newPhoto = null;

  upload.addEventListener("change", function () {
    if (upload.files.length > 0) {
      if (newPhoto) {
        originalPhoto.nextSibling.remove();
      }

      newPhoto =
        ("afterend",
        `<div class="form__group form__photo-upload">
          <img class="form__user-photo" src="img/users/user-64e951c0f1a9732c52d882c6.jpeg" alt="User photo">
          <p id="new-photo-label">Label</p>
        </div>`);
      originalPhoto.insertAdjacentHTML("afterend", newPhoto);

      const newPreview = document.querySelectorAll(".form__user-photo")[1];
      const newPreviewLabel = document.getElementById("new-photo-label");
      imageURLPreview(upload, newPreview, newPreviewLabel);
    }
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
