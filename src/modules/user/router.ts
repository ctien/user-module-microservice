import express from "express";

import * as controller from "./controller";
import * as auth from "./auth-controller";

const router = express.Router();

router.get("/logout", auth.logout);
router.post("/login", auth.login);
router.post("/signup", auth.signup);

router.use(auth.protect);

router.patch("/updateMyPassword", auth.updatePassword);
router.get("/me", controller.getMe);
router.delete("/deleteMe", controller.deleteMe);

/*
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);
*/

// Protect all routes after this middleware

// User role

// Admin role
router.use(auth.restrictTo("admin"));

router.route("/").get(controller.getAll);

router
  .route("/:id")
  .get(controller.getOne)
  .put(controller.updateOne)
  .delete(controller.deleteOne);

export default router;
