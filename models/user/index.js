const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const uniqueValidator = require("mongoose-unique-validator");

// ----------------- User Schema ----------------

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  name: {
    type: String,
    default: function() {
      return this.firstName + " " + this.lastName;
    }
  },
  email: {
    type: String,
    unique: true,
    index: true
  },
  phone: {
    type: String
  },
  companyName: {
    type: String
  },
  address: {
    type: String
  },
  cin: {
    type: String
  },
  pan: {
    type: String
  },
  gstin: {
    type: String
  },
  password: {
    type: String
  },
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: "Invoices" }],
  bills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bills" }],
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contacts" }],
  journalEntries: [{ type: mongoose.Schema.Types.ObjectId, ref: "Journals" }],
  homeDelivery: {
    type: String
  },
  businessOwner: {
    type: String
  },
  businessWebsite: {
    type: String
  },
  vpa: {
    type: String
  },
  isSocialRegister: {
    type: Boolean
  }
});

UserSchema.plugin(uniqueValidator, { message: "User Already Exists" });

// ----------------- Hash Password before Saving ----------------

UserSchema.pre("save", function(next) {
  var user = this;
  if (user.password != "") {
    bcrypt.hash(
      user.password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS),
      (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      }
    );
  } else next();
});

// ----------------- Check Password Match ----------------

UserSchema.methods.isCorrectPassword = async function(password) {
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
};

module.exports = User = mongoose.model("Users", UserSchema);
