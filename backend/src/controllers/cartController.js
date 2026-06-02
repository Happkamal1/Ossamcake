const Cart = require("../models/Cart");
const Cake = require("../models/Cake");

const addToCart = async (req, res) => {

    try {

        const { cakeId, flavor, size, quantity, price } = req.body;

        // Validate cakeId
        if (!cakeId || cakeId === "CAKE_ID") {
            return res.status(400).json({
                success: false,
                message: "Valid cake ID is required"
            });
        }

        // Check if cake exists
        const cake = await Cake.findById(cakeId);
        if (!cake) {
            return res.status(404).json({
                success: false,
                message: "Cake not found"
            });
        }

        const userId = req.user.id;

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        cart.items.push({
            cake: cakeId,
            flavor,
            size,
            quantity,
            price
        });

        await cart.save();

        res.json({
            success: true,
            message: "Cake added to cart",
            data: cart
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }
};

const getCart = async (req, res) => {

    try {

        const cart = await Cart.findOne({
            user: req.user.id
        }).populate("items.cake")

        res.json({
            success: true,
            data: cart
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Server error"
        })

    }
}

module.exports = {
    addToCart,
    getCart
}