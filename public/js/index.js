import displayMap from "./mapbox";
import login, { forgot, logout } from "./log";
import { updateSettings, imageURLPreview } from "./updateSettings";

const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".login--form");
const dataForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const passwordResetForm = document.querySelector(".form-user-password-reset");
const passwordForgotForm = document.querySelector(".form-user-password-forgot");
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

    updateSettings(form, "Update settings");
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
      "Change password"
    );
    saveButton.textContent = "Save password";

    if (didSucceed) {
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    }
  });
}

if (passwordResetForm) {
  passwordResetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("password-new-reset").value;
    const confirmPassword = document.getElementById(
      "password-confirm-reset"
    ).value;
    const token = document.querySelector(".hidden").innerHTML;

    const resetButton = document.getElementById("password-reset-btn");
    resetButton.textContent = "Updating...";
    const didSucceed = await updateSettings(
      { newPassword, confirmPassword, token },
      "Reset password"
    );
    resetButton.textContent = "Reset password";

    if (didSucceed) {
      document.getElementById("password-new-reset").value = "";
      document.getElementById("password-confirm-reset").value = "";
    }
  });
}

if (passwordForgotForm) {
  passwordForgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const resetButton = document.getElementById("password-reset-btn");
    resetButton.textContent = "Sending...";

    await forgot({ email });
    resetButton.textContent = "Continue";
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}
