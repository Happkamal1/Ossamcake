const express = require("express")
const router = express.Router()

const protect = require("../middlewares/authMiddlewares")

const {
 placeOrder,
 getOrders
} = require("../controllers/orderController")

router.post("/place-order",protect,placeOrder)

router.get("/my-orders",protect,getOrders)

module.exports = router