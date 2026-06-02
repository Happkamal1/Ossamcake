const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            cake: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Cake",
            },

            flavor: String,
            size: String,
            quantity: {
                type: Number,
                default: 1,
            },
            price: Number,
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model("Cart", cartSchema);
