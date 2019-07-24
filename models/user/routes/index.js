const router = require("express").Router();
const passport = require("passport");

// ----------------- Require Controller ----------------

const {
  registerUser,
  loginUser,
  updateIsEmailVerified,
  getTokenFromId
} = require("../controller");

// ----------------- Require Validations ----------------

// const USER_VALIDATIONS = require("@validation/user");

// ----------------- Require Factory Methods ----------------

const {
  generateResetLink,
  verifyToken,
  changePassword,
  sendVerificationLink,
  getToken,
  getIdFromToken,
  updateInvoiceList,
  updateContactList,
  updateBillList,
  getLatestInvoiceNumber,
  getLatestBillNumber,
  updateJournalList,
  checkUserExist
} = require("../../../utils/factory/user");

// ----------------- Require Route URLs ----------------

const {
  EMAIL,
  PASSWORD,
  TOKEN,
  AUTH,
  INVOICE
} = require("actyv/utils/auth/routes");

const { AUTH_SCOPE: scope } = require("actyv/utils/enums");
const { SEND_EMAIL_VERIFICATION, UPDATE_EMAIL_STATUS } = EMAIL;
const { GENERATE_RESET_LINK, UPDATE_PASSWORD } = PASSWORD;
const { VERIFY_TOKEN } = TOKEN;
const { AUTH_CREATE_INVOICE } = INVOICE;
const {
  GOOGLE_AUTH,
  REGISTER,
  LOGIN,
  GOOGLE_STRATEGY,
  GOOGLE_CALLBACK,
  JWT_STRATEGY
} = AUTH;

// ----------------- EMAIL ----------------

router.post(SEND_EMAIL_VERIFICATION, sendVerificationLink);

router.post(UPDATE_EMAIL_STATUS, updateIsEmailVerified);

// ----------------- PASSWORD ----------------

router.post(GENERATE_RESET_LINK, generateResetLink);

router.post(UPDATE_PASSWORD, changePassword);

// ----------------- TOKEN ----------------

router.get(`${VERIFY_TOKEN}/:token`, verifyToken);

router.get("/token/get", getToken);

// ----------------- INVOICE ----------------

router.get(AUTH_CREATE_INVOICE, (request, response, next) => {
  passport.authenticate(JWT_STRATEGY, {
    failureRedirect: LOGIN,
    session: false
  })(request, response, next);
});

// ----------------- AUTH ----------------

router.post(REGISTER, registerUser);

router.post(LOGIN, loginUser);

router.get(GOOGLE_AUTH, passport.authenticate(GOOGLE_STRATEGY, { scope }));

router.get(GOOGLE_CALLBACK, (request, response, next) => {
  passport.authenticate(
    GOOGLE_STRATEGY,
    {
      failureRedirect: LOGIN,
      session: false
    },
    user => {
      return response.redirect(
        `${REGISTER}/${Buffer.from(user).toString("base64")}`
      );
    }
  )(request, response, next);
});

router.get("/user/get/token/:id", getTokenFromId);

router.get("/user/id/:token", getIdFromToken);

router.post("/user/invoice/update", updateInvoiceList);

router.post("/user/bill/update", updateBillList);

router.post("/user/contact/update", updateContactList);

router.post("/user/journal/update", updateJournalList);

router.get("/get/invoice/number/:token", getLatestInvoiceNumber);

router.get("/get/bill/number/:token", getLatestBillNumber);

router.get("/user/find/:email", checkUserExist);

// router.get("*", (request, response, next) => {
//   passport.authenticate(JWT_STRATEGY, {
//     failureRedirect: LOGIN,
//     session: false
//   })(request, response, next);
// });

module.exports = router;
