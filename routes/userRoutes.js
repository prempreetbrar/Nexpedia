const express = require("express");

const {
  signUpUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  protect,
} = require("../controllers/authController");

const {
  setUserId,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", loginUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);
router.patch("/changePassword", protect, changePassword);

router
  .route("/me")
  .get(protect, setUserId, getUser)
  .patch(protect, updateMe)
  .delete(protect, deleteMe);

router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
