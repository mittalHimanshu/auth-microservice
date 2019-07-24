const User = require("../../models/user");
const HttpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const { findUserByEmail } = require("../../models/user/controller");

// ----------------- Requiring enums ----------------

const {
  EMAIL: { EMAIL_NOT_REGISTERED },
  PASSWORD: { PASSWORD_CHANGED_ALREADY, PASSWORD_UPDATE_SUCCESS }
} = require("actyv/utils/auth/statics");

const {
  PASSWORD: { UPDATE_PASSWORD },
  EMAIL: { SEND_EMAIL_VERIFICATION }
} = require("actyv/utils/auth/routes");

// ----------------- Generate Password Reset Link ----------------

module.exports.generateResetLink = async (req, res) => {
  const user = await findUserByEmail(req.body.email);
  if (!user)
    return res
      .status(HttpStatus.NOT_FOUND)
      .json({ message: EMAIL_NOT_REGISTERED });
  const { id, email } = user;
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EMAIL_TTL)
  });
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  const mailOptions = {
    to: email,
    from: process.env.GMAIL_USER,
    subject: "Reset Password",
    html: `<a href="http://localhost:3000${UPDATE_PASSWORD}/${token}"> Click Here </a> to reset password`
  };
  smtpTransport.sendMail(mailOptions, function(err) {
    res.status(HttpStatus.OK).json({
      message: `An e-mail has been sent to ${email} with further instructions.`
    });
  });
};

// ----------------- Send Email verification link ----------------

module.exports.sendVerificationLink = async (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: parseInt(process.env.JWT_EMAIL_TTL)
  });
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
  const mailOptions = {
    to: email,
    from: process.env.GMAIL_USER,
    subject: "Verification Link",
    html: `<a href="http://localhost:3000${SEND_EMAIL_VERIFICATION}/${token}"> Click Here </a> to verify your email`
  };
  smtpTransport.sendMail(mailOptions, function(err) {
    res.status(HttpStatus.OK).json({
      message: `An e-mail has been sent to ${email} with further instructions.`
    });
  });
};

// ----------------- Verify Token ----------------

module.exports.verifyToken = (req, res) => {
  const { token } = req.params;
  console.log(token);
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    else res.status(HttpStatus.OK).json({ payload, message: "success" });
  });
};

// ----------------- Update Password in MongoDb ----------------

module.exports.changePassword = (req, res) => {
  jwt.verify(req.body.token, process.env.JWT_SECRET, (err, payload) => {
    const { id } = payload;
    bcrypt.hash(
      req.body.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS),
      async (err, hash) => {
        await User.updateOne(
          { _id: id },
          { $set: { password: hash } },
          { new: true }
        ).exec((err, result) => {
          return res
            .status(HttpStatus.OK)
            .json({ message: PASSWORD_UPDATE_SUCCESS });
        });
      }
    );
  });
};

module.exports.checkUserExist = async (req, res) => {
  const user = await findUserByEmail(req.params.email);
  if (!user) {
    return res
      .status(HttpStatus.NOT_FOUND)
      .json({ message: EMAIL_NOT_REGISTERED });
  } else {
    return res.status(HttpStatus.OK).json({ user });
  }
};

module.exports.getToken = (req, res) => {
  const { token } = req.cookies;
  return res.status(HttpStatus.OK).json({ token });
};

module.exports.getIdFromToken = (req, res) => {
  jwt.verify(req.params.token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    else res.status(HttpStatus.OK).json({ payload, message: "success" });
  });
};

module.exports.updateInvoiceList = (req, res) => {
  const { invoiceId, id } = req.body;
  User.updateOne(
    { _id: id },
    { $push: { invoices: invoiceId } },
    { new: true }
  ).exec((err, result) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    return res.status(HttpStatus.OK).json({ message: "Successfull" });
  });
};

module.exports.updateBillList = (req, res) => {
  const { billId, id } = req.body;
  User.updateOne({ _id: id }, { $push: { bills: billId } }, { new: true }).exec(
    (err, result) => {
      if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
      return res.status(HttpStatus.OK).json({ message: "Successfull" });
    }
  );
};

module.exports.updateContactList = (req, res) => {
  const { contactId, id } = req.body;
  User.updateOne(
    { _id: id },
    { $push: { contacts: contactId } },
    { new: true }
  ).exec((err, result) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    return res.status(HttpStatus.OK).json({ message: "Successfull" });
  });
};

module.exports.updateJournalList = (req, res) => {
  const { journalId, id } = req.body;
  User.updateOne(
    { _id: id },
    { $push: { journalEntries: journalId } },
    { new: true }
  ).exec((err, result) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    return res.status(HttpStatus.OK).json({ message: "Successfull" });
  });
};

module.exports.getLatestInvoiceNumber = (req, res) => {
  const { token } = req.params ? req.params : req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    else {
      const { id } = payload;
      User.findOne({ _id: id }).exec((err, result) => {
        if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
        return res
          .status(HttpStatus.OK)
          .json({ length: result.invoices.length });
      });
    }
  });
};

module.exports.getLatestBillNumber = (req, res) => {
  const { token } = req.params ? req.params : req.cookies;
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
    else {
      const { id } = payload;
      User.findOne({ _id: id }).exec((err, result) => {
        if (err) return res.status(HttpStatus.FORBIDDEN).json({ message: err });
        return res.status(HttpStatus.OK).json({ length: result.bills.length });
      });
    }
  });
};
