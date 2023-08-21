async function login(email, password) {
  console.log(email, password);

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
      alert("Logged in successfully!");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    alert(error.response.data.message);
  }
}

const loginForm = document.querySelector(".form");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  console.log("Submitted!");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
