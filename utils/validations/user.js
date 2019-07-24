const { check } = require("express-validator/check");
const gstValidator = require("gstin-validator");

module.exports = [
  check("firstName")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("First name cannot be empty"),

  check("email")
    .isEmail()
    .trim()
    .escape()
    .withMessage("Enter a valid email address"),

  check("mobileNo")
    .isMobilePhone()
    .trim()
    .escape()
    .withMessage("Enter a valid mobile number"),

  check("companyName")
    .not()
    .isEmpty()
    .trim()
    .escape()
    .withMessage("Company Name cannot be empty"),

  check("pan", "PAN is invalid").custom(value => {
    if (value != "") {
      let pattern = new RegExp("[A-Z]{5}[0-9]{4}[A-Z]{1}s");
      return pattern.test(value);
    } else return true;
  }),

  check("password")
    .isLength({ min: 8 })
    .withMessage("Min password length should be 8"),

  check("gstin", "GSTIN is invalid").custom(value => {
    console.log(value);
    if (value != "") return gstValidator.isValidGSTNumber(value);
    else return true;
  }),

  check("retypePassword", "Password does not match")
    .exists()
    .custom((value, { req }) => {
      return value === req.body.password;
    })
];
