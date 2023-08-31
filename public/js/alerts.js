export function showAlert(type, message, time = 5) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);

  setTimeout(hideAlert, time * 1000);
}

export function hideAlert() {
  const alert = document.querySelector(".alert");
  if (alert) alert.remove();
}
