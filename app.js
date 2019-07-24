const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const app = express();
var cors = require("cors");

require("./connection/mongoose");
require("./connection/passport/strategy");

const {
  ROOT,
  AUTH: { LOGIN, JWT_STRATEGY }
} = require("actyv/utils/auth/routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

app.use(ROOT, require("./models/user/routes"));

// app.use("/ai", require("@models/ai_ml/routes"));

app.get("/", (req, res) => {
  res.send("Auth service started").end();
});

module.exports = app;
