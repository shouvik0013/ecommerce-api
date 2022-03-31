const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = new Schema({
  products: [
    {
      product: { type: Object, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  user: {
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },

  // fulfilled: {
  //   type: Schema.Types.Boolean,
  //   required: false
  // }
});

module.exports = mongoose.model("Order", orderSchema);
