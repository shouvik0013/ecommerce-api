const express = require("express");
const Product = require("../models/product"); // Product  is a class
const User = require("../models/user");
const Order = require("../models/order");

const { Types } = require("mongoose");

const ITEMS_PER_PAGE = 5;

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getProducts = (req, res, next) => {
  let productPageIndex = +req.query.productPageIndex;

  Product.find()
    .skip((productPageIndex - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .then((products) => {
      if (!products) {
        const error = new Error("Products not found");
        error.statusCode = 500;
        throw error;
      }
      return res.status(200).json({
        message: "Products fetched from database",
        products: products,
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
 * Fetches the specific products &
 * displays the details of the product
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 * @returns {null}
 */
module.exports.getProduct = (req, res, next) => {
  /**
   *  @type {String}
   * GETTING productId FROM REQUEST URL
   */
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        const error = new Error("No products found.");
        error.statusCode = 404;
        throw error;
      }

      return res
        .status(200)
        .json({ message: "Product details fetched", product: product });
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
module.exports.getCart = (req, res, next) => {
  User.findById(Types.ObjectId(req.userId))
    .populate("cart.items.prodId")
    .then((user) => {
      if (!user) {
        const error = new Error("Server issue");
        error.statusCode = 500;
        throw error;
      }

      console.log("Products Array -> ");
      console.log(JSON.stringify(user, null, 2));
      const fetchedProducts = user.cart.items;

      return res.status(200).json({
        message: "User cart details fetched",
        products: fetchedProducts,
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
module.exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  let fetchedUser;
  User.findById(Types.ObjectId(req.userId))
    .then((userDoc) => {
      if (!userDoc) {
        const error = new Error("Server issue");
        error.statusCode = 500;
        throw error;
      }
      fetchedUser = userDoc;
      return Product.findById(Types.ObjectId(productId));
    })
    .then((productDoc) => {
      if (!productDoc) {
        const error = new Error("No product found");
        error.statusCode = 404;
        next(error);
      }
      return fetchedUser.addToCart(productDoc);
    })
    .then((result) => {
      return res.status(200).json({
        message: "Product saved into cart",
        data: result.cart.items,
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
module.exports.postOrder = (req, res, next) => {
  let fetchedUser;
  let placedOrder;

  User.findById(Types.ObjectId(req.userId))
    .populate("cart.items.prodId")
    .then((user) => {
      if (!user) {
        const error = new Error("No user found");
        error.statusCode = 401;
        next(error);
      }
      fetchedUser = user;

      console.log("USER CART DATA -> ");
      console.log(JSON.stringify(user.cart.items, null, 2));
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.prodId._doc }, // to copy all the details of product
          // here _doc basically return the full "product" object
        };
      });

      const newOrder = new Order({
        user: {
          email: fetchedUser.email,
          userId: fetchedUser._id,
        },
        products: products,
      });

      return newOrder.save();
    })
    .then((result) => {
      placedOrder = result;
      return fetchedUser.clearCart();
    })
    .then((result) => {
      res.status(200).json({
        message: "Order placed",
        data: placedOrder,
      });
    })
    .catch((err) => console.log(err));
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": Types.ObjectId(req.userId) })
    .then((orders) => {
      if (!orders) {
        const error = new Error("No orders found");
        error.statusCode = 401;
        throw error;
      }

      console.log("ORDER OF THE USER ->");
      console.log(JSON.stringify(orders, null, 2));
      return res
        .status(200)
        .json({ message: "Orders fetched", orders: orders });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports.postCheckout = (req, res, next) => {
  Order.find({ "user.userId": Types.ObjectId(req.userId) })
    .then((orders) => {
      if (!orders) {
        const error = new Error("No orders found");
        error.statusCode = 500;
        throw error;
      }
      console.log(JSON.stringify(orders, null, 2));
      let totalAmount = 0;
      orders.forEach(orderItem => {
        orderItem.products.forEach(prod => {
          totalAmount = totalAmount + Number(prod.product.price) * prod.quantity;
        })
      })

      return res.status(200).json({ totalAmount: totalAmount});
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
