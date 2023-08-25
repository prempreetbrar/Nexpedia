import axios from "axios";
import showAlert from "./alerts";

export async function updateData(newEmail, newName) {
  try {
    const response = await axios({
      method: "PATCH",
      url: "http://localhost:3000/api/v1/users/me",
      data: {
        email: newEmail,
        name: newName,
      },
    });

    if (response.data.status === "success") {
      showAlert("success", "Data updated");
    } else {
      showAlert("error", "Something went wrong. Please contact support.");
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}
