const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Schema, Types, SchemaType } = require("mongoose");
const { validationResult } = require("express-validator");

const User = require("../models/user");

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  let fetchedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found");
        error.statusCode = 401;
        throw err;
      }

      fetchedUser = user;
      return bcrypt.compare(password, user.password).then((isAuthenticated) => {
        if (!isAuthenticated) {
          const error = new Error("Wrong password");
          error.statusCode = 401;
          throw error;
        }

        const token = jwt.sign(
          {
            email: fetchedUser.email,
            userId: fetchedUser._id.toString(),
          },
          process.env.SECRET_KEY,
          { expiresIn: "1h" }
        );

        res
          .status(200)
          .json({ token: token, userId: fetchedUser._id.toString() });
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
exports.postSignup = (req, res, next) => {
  console.log("In postSignup");
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("validation failed");
    console.log(errors.array());
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const newUser = new User({
        email: email,
        name: name,
        password: hashedPassword,
        cart: { items: [] },
      });

      return newUser.save();
    })
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error("Internal error.");
        error.statusCode = 500;
        throw error;
      }

      res.status(200).json({ message: "User created", userId: userDoc._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
