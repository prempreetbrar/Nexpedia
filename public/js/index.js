import displayMap from "./mapbox";
import { login, forgot, logout, signup } from "./auth";
import { updateSettings, imageURLPreview } from "./updateSettings";
import bookTour from "./stripe";
import showAlert from "./alerts";

const mapBox = document.getElementById("map");
const signupForm = document.querySelector(".signUp--form");
const loginForm = document.querySelector(".login--form");
const dataForm = document.querySelector(".form-user-data");
const passwordForm = document.querySelector(".form-user-password");
const passwordResetForm = document.querySelector(".form-user-password-reset");
const passwordForgotForm = document.querySelector(".form-user-password-forgot");
const logoutButton = document.querySelector(".nav__el--logout");
const bookButton = document.getElementById("book-tour");
const alertMessage = document.querySelector("body").dataset.alert;
const upload = document.querySelector("#photo");

function clear(didSucceed, ...DOMIds) {
  if (didSucceed) {
    for (const id of DOMIds) {
      document.getElementById(id).value = "";
    }
  }
}

async function buttonUpdate(buttonId, tempText, originalText, handler, data) {
  const button = document.getElementById(buttonId);
  button.textContent = tempText;
  const didSucceed = await handler(data);
  button.textContent = originalText;

  return didSucceed;
}

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
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

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    const didSucceed = buttonUpdate("signup", "Creating...", "Create", signup, {
      name,
      email,
      password,
      confirmPassword,
    });

    clear(didSucceed, "password", "password-confirm");
  });
}

if (passwordForm) {
  passwordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById("password-current").value;
    const newPassword = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    const didSucceed = await buttonUpdate(
      "save-password",
      "Updating...",
      "Save password",
      updateSettings,
      { currentPassword, newPassword, confirmPassword },
      "Change password"
    );

    clear(didSucceed, "password-current", "password", "password-confirm");
  });
}

if (passwordResetForm) {
  passwordResetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("password-new-reset").value;
    const confirmPassword = document.getElementById(
      "password-confirm-reset"
    ).value;
    const token = document.querySelector(".hidden").dataset.token;

    const didSucceed = await buttonUpdate(
      "password-reset-btn",
      "Updating...",
      "Reset password",
      updateSettings,
      { newPassword, confirmPassword, token },
      "Reset password"
    );

    clear(didSucceed, "password-new-reset", "password-confirm-reset");
  });
}

if (passwordForgotForm) {
  passwordForgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    buttonUpdate("password-reset-btn", "Sending...", "Continue", forgot, {
      email,
    });
  });
}

async function buttonUpdate(buttonId, tempText, originalText, handler, data) {
  const button = document.getElementById(buttonId);
  button.textContent = tempText;
  const didSucceed = await handler(data);
  button.textContent = originalText;

  return didSucceed;
}

if (bookButton) {
  bookButton.addEventListener("click", async (e) => {
    const { tourId } = e.target.dataset;
    buttonUpdate(
      event.target.id,
      "Processing...",
      "Book Tour Now!",
      bookTour,
      tourId
    );
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login({ email, password });
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

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

if (alertMessage) {
  showAlert("success", alertMessage, 15);
}
