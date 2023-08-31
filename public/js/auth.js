import { showAlert } from "./alerts";
import factory from "./factory";

export const signup = factory(
  "POST",
  "/api/v1/users/signup",
  (data) => {
    showAlert("success", `Welcome!`);
    window.setTimeout(() => location.assign("/me"), 1500);
    return true;
  },
  (error) => {
    showAlert("error", error.response.data.message);
    return false;
  }
);

export const login = factory(
  "POST",
  `/api/v1/users/login`,
  (data) => {
    showAlert("success", "Logged in successfully!");
    window.setTimeout(() => {
      location.assign("/");
    }, 1500);
  },
  (error) => showAlert("error", error.response.data.message)
);

export const logout = factory(
  "GET",
  "/api/v1/users/logout",
  (data) => location.reload(true),
  (error) => showAlert("error", "Error logging out! Try again.")
);

export const forgot = factory(
  "POST",
  "/api/v1/users/forgotPassword",
  (data) => showAlert("success", `Sent email to ${data.email}!`),
  (error) => showAlert("error", error.response.data.message)
);
