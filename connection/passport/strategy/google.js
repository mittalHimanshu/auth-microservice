var GoogleStrategy = require("passport-google-oauth2").Strategy;
const passport = require("passport");

// -------------- GOOGLE OAuth2.0 -----------

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    function(request, accessToken, refreshToken, profile, done) {
      const firstName = profile.given_name;
      const lastName = profile.family_name;
      const email = profile.email;
      const user_data = { firstName, lastName, email };
      console.log(user_data);
      return done(JSON.stringify(user_data));
    }
  )
);
