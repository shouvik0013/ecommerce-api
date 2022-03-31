// CORE MOUDLES
const path = require("path");

// THIRD PARTY
const express = require("express"); // EXPRESS
const bodyParser = require("body-parser"); // BODY PARSER
const multer = require("multer");
const genUid = require("generate-unique-id");

// ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

const rootDirectoryPath = require("./utils/path");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(rootDirectoryPath, process.env.TEMP_UPLOAD_PATH));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      genUid({ length: 10, useLetters: true, useNumbers: true }) +
        "-" +
        file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  /**
   * {
      fieldname: 'image',
      originalname: 'Capture.PNG',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'images',
      filename: 'PcPOrBZ_TVfO-Capture.PNG',
      path: 'images\\PcPOrBZ_TVfO-Capture.PNG',
      size: 38472
    }
   */

  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// PARSES INCOMMING REQUEST
app.use(bodyParser.json()); // bodyParser is also a middleware
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image") // "image" name of the input field
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// SETTING UP ROUTES INTO app
app.use("/admin", adminRoutes);
app.use("/", shopRoutes);
app.use(authRoutes);

app.use((error, req, res, next) => {
  console.log("IN APP.JS ERROR HANDLER -> " + error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data || null;
  res.status(status).json({ message: message, data: data });
});

module.exports = app;
