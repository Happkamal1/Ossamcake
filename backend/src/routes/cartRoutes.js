const express = require("express")
const router = express.Router()

const {
 addToCart,
 getCart
} = require("../controllers/cartController")

const protect = require("../middlewares/authMiddlewares")

router.post("/addTocart",protect,addToCart)
router.get("/get-cart",protect,getCart)

module.exports = router