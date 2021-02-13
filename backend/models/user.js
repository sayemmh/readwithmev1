const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    activationToken: {
      type: String,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Number,
    },
    inboxBlocks: [
      {
        tag: {
          type: String,
          required: true,
        },
        html: {
          type: String,
          required: false,
        },
        imageUrl: {
          type: String,
          required: false,
        },
      },
    ],
    pages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Page",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
