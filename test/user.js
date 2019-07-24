const HttpStatus = require("http-status-codes");
const jwt = require("jsonwebtoken");

const { EMAIL, PASSWORD, AUTH } = require("actyv/utils/auth/routes");
const { SEND_EMAIL_VERIFICATION, UPDATE_EMAIL_STATUS } = EMAIL;
const { GENERATE_RESET_LINK, UPDATE_PASSWORD } = PASSWORD;
const { REGISTER } = AUTH;
const {
  EMAIL: { EMAIL_NOT_REGISTERED },
  PASSWORD: { PASSWORD_UPDATE_SUCCESS }
} = require("actyv/utils/auth/statics");

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../bin/www");
const User = require("@models/user");
const mongoose = require("mongoose");
const should = chai.should();

const payload = {
  firstName: "test",
  lastName: "1",
  email: "test@test.com",
  mobileNo: "8847359374",
  companyName: "test company",
  password: "qwertyuiop",
  retypePassowrd: "qwertyuiop"
};

let testUser;
let token;

chai.use(chaiHttp);

before(done => {
  User.create(payload, (err, user) => {
    testUser = user;
    const { id } = user;
    token = jwt.sign({ id }, process.env.JWT_SECRET);
    done();
  });
});

/*
 * Test Register User /register
 */

describe("/POST register user", () => {
  it("it should return error if user already exists", done => {
    chai
      .request(server)
      .post(REGISTER)
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.NOT_ACCEPTABLE);
        res.body.should.be.a("object");
        res.body.should.have.property("errors");
        res.body.errors.should.have.property("email");
        res.body.errors.email.should.have
          .property("message")
          .eql("User Already Exists");
        done();
      });
  });
});

/*
 * Test the /POST route /email/verify
 */

describe("/POST send email verification link", () => {
  it("it should send an email verification link", done => {
    let payload = {
      email: "mittalhimanshu151@gmail.com"
    };
    chai
      .request(server)
      .post(SEND_EMAIL_VERIFICATION)
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql(
            `An e-mail has been sent to ${
              payload.email
            } with further instructions.`
          );
        done();
      });
  });
});

/*
 * Test the /POST route /email/status
 */

describe("/POST update verified email status", () => {
  it("it should update verification status", done => {
    let payload = {
      email: "nbdbchdbc@gmail.com"
    };
    chai
      .request(server)
      .post(UPDATE_EMAIL_STATUS)
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql("Email Verified Successfully");
        done();
      });
  });
});

/*
 * Test the /POST route /password/reset
 */

describe("/POST generate password reset link", () => {
  it("it should generate password reset link", done => {
    let payload = {
      email: "mittalhimanshu151@gmail.com"
    };
    chai
      .request(server)
      .post(GENERATE_RESET_LINK)
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have
          .property("message")
          .eql(
            `An e-mail has been sent to ${
              payload.email
            } with further instructions.`
          );
        done();
      });
  });
});

/*
 * Test the /POST route /password/reset
 */

describe("/POST return error if user not found", () => {
  it("it should return error if user not found", done => {
    let payload = {
      email: "nouser@gmail.com"
    };
    chai
      .request(server)
      .post(GENERATE_RESET_LINK)
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.NOT_FOUND);
        res.body.should.be.a("object");
        res.body.should.have.property("message").eql(EMAIL_NOT_REGISTERED);
        done();
      });
  });
});

/*
 * Test the /POST route /password/update
 */

describe("/POST update user password", () => {
  it("it should update user password", done => {
    let payload = {
      password: "asdfghjkl",
      token
    };
    chai
      .request(server)
      .post(UPDATE_PASSWORD)
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("message").eql(PASSWORD_UPDATE_SUCCESS);
        done();
      });
  });
});

/*
 * Test the /GET route /token/get
 */

describe("/GET get token from cookies", () => {
  it("it should return token from the cookies", done => {
    chai
      .request(server)
      .get("/token/get")
      .set("Cookie", `token=${token}`)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("token").eql(token);
        done();
      });
  });
});

/*
 * Test the /GET route /user/id/:token
 */

describe("/GET get user id from token", () => {
  it("it should return user id from token", done => {
    chai
      .request(server)
      .get(`/user/id/${token}`)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("payload");
        res.body.payload.should.have.property("id").eql(testUser.id);
        done();
      });
  });
});

/*
 * Test the /GET route /user/invoice/update
 */

describe("/POST update invoice list", () => {
  it("it should push new invoice id to user schema ", done => {
    const payload = { invoiceId: mongoose.Types.ObjectId(), id: testUser.id };
    chai
      .request(server)
      .post("/user/invoice/update")
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("message").eql("Successfull");
        done();
      });
  });
});

/*
 * Test the /GET route /user/bill/update
 */

describe("/POST update bill list", () => {
  it("it should push new bill id to user schema ", done => {
    const payload = { billId: mongoose.Types.ObjectId(), id: testUser.id };
    chai
      .request(server)
      .post("/user/bill/update")
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("message").eql("Successfull");
        done();
      });
  });
});

/*
 * Test the /GET route /user/contact/update
 */

describe("/POST update contact list", () => {
  it("it should push new contact id to user schema ", done => {
    const payload = { contactId: mongoose.Types.ObjectId(), id: testUser.id };
    chai
      .request(server)
      .post("/user/contact/update")
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("message").eql("Successfull");
        done();
      });
  });
});

/*
 * Test the /GET route /user/journal/update
 */

describe("/POST update journal list", () => {
  it("it should push new journal id to user schema ", done => {
    const payload = { journalId: mongoose.Types.ObjectId(), id: testUser.id };
    chai
      .request(server)
      .post("/user/journal/update")
      .send(payload)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("message").eql("Successfull");
        done();
      });
  });
});

/*
 * Test the /GET route /get/invoice/number
 */

describe("/GET get latest invoice number", () => {
  it("it should return latest invoice number", done => {
    chai
      .request(server)
      .get("/get/invoice/number")
      .set("Cookie", `token=${token}`)
      .end((err, res) => {
        res.should.have.status(HttpStatus.OK);
        res.body.should.be.a("object");
        res.body.should.have.property("length").eql(1);
        done();
      });
  });
});

after(done => {
  User.deleteOne({ email: payload.email }, err => {
    done();
  });
});
