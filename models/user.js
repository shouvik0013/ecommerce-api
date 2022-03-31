const mongoose = require("mongoose");
const { Schema, Types, SchemaType } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  cart: {
    items: [
      {
        prodId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Schema.Types.Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.prodId.toString() === product._id.toString();
  });

  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      prodId: product,
      quantity: newQuantity,
    });
  }

  let updatedCart = {
    items: updatedCartItems,
  };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.removeProductFromCart = function (prodId) {
  const updatedCartItems = this.cart.items.filter((item) => {
    return item.prodId.toString() !== prodId.toString();
  });

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];

  return this.save();
};

module.exports = mongoose.model("User", userSchema);
