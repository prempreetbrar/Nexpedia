export default function showAlert(type, message) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);

  setTimeout(hideAlert, 5000);
}

export function hideAlert() {
  const alert = document.querySelector(".alert");
  if (alert) alert.remove();
}
