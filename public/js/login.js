async function login(email, password) {
  console.log(email, password);

  try {
    const result = await axios({
      method: "POST",
      url: `http://localhost:3000/api/v1/users/login`,
      data: {
        email,
        password,
      },
    });

    console.log(result);
  } catch (error) {
    console.log(error.response.data);
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
