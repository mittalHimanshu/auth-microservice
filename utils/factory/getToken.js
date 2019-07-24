module.exports = req => {
  if (req && req.cookies) {
    return req.cookies["token"];
  }
};
