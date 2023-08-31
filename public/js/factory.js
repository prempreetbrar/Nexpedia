import axios from "axios";

export default function factory(method, url, successFunction, errorFunction) {
  return async function (data = null) {
    try {
      const response = await axios({
        method,
        url,
        data,
      });

      if (response.data.status === "success") {
        successFunction(data);
      }
    } catch (error) {
      errorFunction(error);
    }
  };
}
