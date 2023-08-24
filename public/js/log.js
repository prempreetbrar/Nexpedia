import axios from "axios";
import showAlert from "./alerts";

export default async function login(email, password) {
  try {
    const response = await axios({
      method: "POST",
      url: `http://localhost:3000/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });

    if (response.data.status === "success") {
      showAlert("success", "Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}

export async function logout() {
  try {
    const response = await axios({
      method: "GET",
      url: "http://localhost:3000/api/v1/users/logout",
    });

    if (response.data.status === "success") {
      location.reload(true);
    }
  } catch (error) {
    showAlert("error", "Error logging out! Try again.");
  }
}