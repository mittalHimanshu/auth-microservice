// ----------------- Require Modules ----------------

var mongoose = require("mongoose");
var dbURL = process.env.mongoURI;
const {
  MONGOOSE: { CONNECTED, DISCONNECTED, ERROR, SIGINT }
} = require("actyv/utils/enums");
const { consoleLogger, logger } = require("./logger");

// ----------------- Mongoose Config ----------------

const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false,
  reconnectTries: Number.MAX_VALUE,
  reconnectInterval: 500,
  poolSize: 10,
  bufferMaxEntries: 0
};

// ----------------- Mongoose Connection ----------------

mongoose.connect(process.env.mongoURI, options);

// ----------------- CONNECTED Event Handler ----------------

mongoose.connection.on(CONNECTED, () => {
  consoleLogger.info("Mongoose connection is open to ", dbURL);
});

// ----------------- ERROR Event Handler ----------------

mongoose.connection.on(ERROR, err => {
  logger.error("Mongoose connection has occured " + err + " error");
});

// ----------------- DISCONNECTED Event Handler ----------------

mongoose.connection.on(DISCONNECTED, () => {
  logger.info("Mongoose connection is disconnected");
});

// ----------------- Unexpected Shutdown Event Handler ----------------

process.on(SIGINT, function() {
  mongoose.connection.close(() => {
    logger.info(
      "Mongoose connection is disconnected due to application termination"
    );
    process.exit(0);
  });
});
