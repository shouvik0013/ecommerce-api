const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

// router is also kind of app or a pluggable app
const router = express.Router();

// PATH: /products?productPageIndex=1      here 1 will return first 5 products, if we pass 2 it will return next 5 results
router.get("/products", isAuth, shopController.getProducts);
// PATH: /products/874729902
router.get("/products/:productId", isAuth, shopController.getProduct);

// PATH: /cart
router.get("/cart", isAuth, shopController.getCart);  // returns cart details of an user
router.post("/cart", isAuth, shopController.postCart); // call it with "productId" field to add an item to cart

// return orders of an user
router.get("/orders", isAuth, shopController.getOrders);
// posting an order
router.post("/create-order", isAuth, shopController.postOrder);

// return totalAmount
router.post("/checkout", isAuth, shopController.postCheckout);

module.exports = router;
