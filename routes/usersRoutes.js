const express = require("express");

const { signUpUser } = require("../controllers/authController");
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

const router = express.Router();
router.post("/signup", signUpUser);

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
