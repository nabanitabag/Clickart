const express = require("express");
const validate = require("../../middlewares/validate");
const userValidation = require("../../validations/user.validation");
const userController = require("../../controllers/user.controller");
const auth = require("../../middlewares/auth");

const router = express.Router();

// route definitions for `/v1/users/:userId`
router.get(
  '/:userId',
  auth(), 
  validate(userValidation.getUser), 
  userController.getUser
  );

router.put(
  "/:userId",
  auth(),
  validate(userValidation.setAddress),
  userController.setAddress
);

module.exports = router;
