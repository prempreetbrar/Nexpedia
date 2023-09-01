import axios from "axios";
import { showAlert } from "./alerts";

export async function updateSettings(data, type) {
  let url;
  switch (type) {
    case "Change password":
      url = "/api/v1/users/changePassword";
      break;
    case "Reset password":
      url = `/api/v1/users/resetPassword/${data.token}`;
      break;
    default:
      url = "/api/v1/users/me";
  }

  try {
    const response = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (response.data.status === "success") {
      showAlert("success", `${type} succeeded`);

      if (data instanceof FormData && data.has("photo")) {
        window.setTimeout(() => {
          location.reload(true);
        }, 1500);
      } else if (data instanceof Object && "token" in data) {
        window.setTimeout(() => {
          location.assign("/me");
        }, 1500);
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
