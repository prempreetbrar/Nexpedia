const express = require("express");

const {
  signUpUser,
  loginUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/usersController");

const router = express.Router();
router.post("/signup", signUpUser);
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
