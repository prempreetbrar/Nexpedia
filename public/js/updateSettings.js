import axios from "axios";
import showAlert from "./alerts";

export async function updateSettings(data, type) {
  try {
    const response = await axios({
      method: "PATCH",
      url:
        type === "Password"
          ? "http://localhost:3000/api/v1/users/changePassword"
          : "http://localhost:3000/api/v1/users/me",
      data,
    });

    if (response.data.status === "success") {
      showAlert("success", `${type} updated`);

      if (data.has("photo")) {
        window.setTimeout(() => {
          location.reload(true);
        }, 2000);
      }

      return true;
    } else {
      showAlert("error", "Something went wrong. Please contact support.");
      return false;
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
}

export function imageURLPreview(upload, newPreview, newPreviewLabel) {
  const [newPhoto] = upload.files;
  if (newPhoto) {
    newPreview.src = URL.createObjectURL(newPhoto);
    newPreviewLabel.innerHTML = upload.value.split("\\").pop();
  }
}
