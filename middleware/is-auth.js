const jwt = require("jsonwebtoken");
const expres = require("express");

const jwt_secret_key = process.env.SECRET_KEY;
/**
 *
 * @param {expres.Request} req
 * @param {expres.Response} res
 * @param {Function} next
 */
module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  console.log("In is-auth -> " + authHeader);
  if (!authHeader) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, jwt_secret_key);
  } catch (error) {
    error.statusCode = 500;
    error.message = "Invalid token";
    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  req.userId = decodedToken.userId; // SETTING USERID TO REQ OBJECT
  next();
};
