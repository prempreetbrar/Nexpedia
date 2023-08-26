const express = require("express");

const {
  signUpUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  protect,
  restrictTo,
  logoutUser,
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
  uploadMyPhoto,
  resizeMyPhoto,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.use(protect);
router.patch("/changePassword", changePassword);
router
  .route("/me")
  .get(setUserId, getUser)
  .patch(uploadMyPhoto, resizeMyPhoto, updateMe)
  .delete(deleteMe);

router.use(restrictTo("admin"));
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
