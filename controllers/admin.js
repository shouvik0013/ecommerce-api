// THIRD-PARTY PACKAGES
const express = require("express");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");
// "Product" CLASS
const Product = require("../models/product");
const User = require("../models/user");
const { Types } = require("mongoose");

/**
 * SAVES A PRODUCT INTO THE DATABASE
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;

  console.log("FROM postAddProduct. imageUrl ->");
  console.log(image);
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

  if (!image) {
    const error = new Error("No image provided");
    error.statusCode = 422;
    throw error;
  }

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("validation failed");
    console.log(errors.array());
    const error = new Error("Validation failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const imageUrl = image.path;

  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId: req.userId.toString(),
  });

  let creator;

  User.findById(Types.ObjectId(req.userId))
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error("Internal error.");
        error.statusCode = 500;
        throw error;
      }
      creator = userDoc;
      return product.save();
    })
    .then((productDoc) => {
      res.status(201).json({
        message: "Product created",
        product: productDoc,
        creator: { _id: creator._id.toString(), name: creator.name },
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
 * Deletes product from file/database &
 * if present in Cart also deletes the product
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.findOne({ _id: productId, userId: Types.ObjectId(req.userId) })
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found."));
      }

      if (product.userId.toString() !== req.userId.toString()) {
        return res.status(401).json({ message: "Not authenticated to delete" });
      }

      fileHelper(product.imageUrl);
      return Product.deleteOne({
        _id: productId,
        userId: Types.ObjectId(req.userId),
      });
    })
    .then((result) => {
      // console.log("PRODUCT HAS BEEN DELETED");
      // console.log("RESULT OF DELETION -> " + result);
      // res.redirect("/admin/products");
      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
