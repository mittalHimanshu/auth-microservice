const User = require("../index");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// ----------------- Requiring Http Status Codes ----------------

var HttpStatus = require("http-status-codes");

// ----------------- Require Validation Result ----------------

const { validationResult } = require("express-validator/check");

// ----------------- Require Enums ----------------

const {
  AUTH: { LOCAL_STRATEGY }
} = require("actyv/utils/auth/routes");

// ----------------- Handle User Registration ----------------

module.exports.registerUser = (req, res) => {
  User.create(req.body, (err, user) => {
    if (err) {
      return res.status(HttpStatus.NOT_ACCEPTABLE).json(err);
    }
    const { id } = user;
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: parseInt(process.env.JWT_TTL)
    });
    return res.status(HttpStatus.OK).send({ token });
  });
};

// ----------------- Handle User login ----------------

module.exports.loginUser = (req, res, next) => {
  console.log("hello");
  passport.authenticate(
    LOCAL_STRATEGY,
    { session: false },
    (err, user, info) => {
      if (err || !user) {
        const { message } = info;
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message,
          user
        });
      }
      req.login(user, { session: false }, err => {
        if (err) {
          return res.status(HttpStatus.FORBIDDEN).json({ err });
        }
        const { id } = user;
        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: parseInt(process.env.JWT_TTL)
        });
        res.cookie("token", token); // secure: true in production
        return res.status(HttpStatus.OK).end();
      });
    }
  )(req, res);
};

module.exports.getTokenFromId = (req, res) => {
  const { id } = req.params;
  console.log("id ", id);
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_TTL)
  });
  console.log("token", token);
  return res.status(HttpStatus.OK).send({ token });
};

// ----------------- Find User By Id ----------------

module.exports.findUserById = async _id => {
  return await User.findOne({ _id }).exec();
};

// ----------------- Find User By Email ----------------

module.exports.findUserByEmail = async email => {
  return await User.findOne({ email }).exec();
};

// ----------------- Update isEmailVerified ----------------

module.exports.updateIsEmailVerified = (req, res) => {
  const { email } = req.body;
  User.updateOne(
    { email },
    { $set: { isEmailVerified: true } },
    { new: true }
  ).exec((err, result) => {
    return res
      .status(HttpStatus.OK)
      .json({ message: "Email Verified Successfully" });
  });
};
