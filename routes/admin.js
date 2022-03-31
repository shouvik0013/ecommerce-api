const express = require("express");
const { body } = require("express-validator");

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

// PATH: /admin/product
router.post(
  "/add-product",
  [
    body(
      "title",
      "Title must be at least 3 characters long and should contain only alphanumeric values"
    )
      .trim()
      .isString()
      .isLength({ min: 3, max: 40 }),
    body("price").isFloat().withMessage("Enter only decimal values"),
    body("description")
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Description must be at least 5 characters long"),
  ],
  isAuth,
  adminController.postAddProduct
);

// PATH: /admin/delete-product
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
