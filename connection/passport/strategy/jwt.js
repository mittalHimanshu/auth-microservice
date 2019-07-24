const passport = require("passport");
const JWTStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("../../../utils/factory/getToken");
const { findUserById } = require("../../../models/user/controller");

// -------------- JWT STRATEGY -----------

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT,
      secretOrKey: process.env.JWT_SECRET
    },
    async function(jwtPayload, done) {
      await findUserById(jwtPayload.id).then(user => {
        return done(null, user);
      });
    }
  )
);
