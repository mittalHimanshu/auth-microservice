const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const { findUserByEmail } = require("../../../models/user/controller");

// -------------- Requiring Enums -----------

const {
  AUTH: { WRONG_PASSWORD, LOGIN_SUCCESSFULL, USER_NOT_FOUND }
} = require("actyv/utils/auth/statics");

// -------------- LOCAL STRATEGY -----------

passport.use(
  new localStrategy(
    {
      usernameField: process.env.USERNAME_FIELD,
      passwordField: process.env.PASSWORD_FIELD
    },
    async (email, password, done) => {
      const user = await findUserByEmail(email);
      if (!user) return done(null, false, { message: USER_NOT_FOUND });
      const validate = await user.isCorrectPassword(password);
      if (!validate) return done(null, false, { message: WRONG_PASSWORD });
      return done(null, user, {
        message: LOGIN_SUCCESSFULL
      });
    }
  )
);
