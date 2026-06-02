const Cake = require("../models/Cake");

const addCake = async (req, res) => {
  try {

    const {
      name,
      description,
      categories,
      basePrice,
      variants,
      specialOffer
    } = req.body;

    if (!name || !basePrice) {
      return res.status(400).json({
        success: false,
        message: "Name and base price required"
      });
    }

    if (!variants || variants.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one variant required"
      });
    }

    const cake = new Cake({
      name,
      description,
      categories,
      basePrice,
      variants,
      specialOffer
    });

    const savedCake = await cake.save();

    res.status(201).json({
      success: true,
      message: "Cake created successfully",
      data: savedCake
    });

  } catch (error) {

    console.error("Add Cake Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// GET ALL CAKES
const getCakes = async (req, res) => {
  try {

    const { search, category, flavor, limit } = req.query;

    let filter = {};

    // search logic
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { "variants.flavor": { $regex: search, $options: "i" } }
      ];
    }

    // category filter
    if (category) {
      filter.categories = category;
    }

    // flavor filter
    if (flavor) {
      filter["variants.flavor"] = flavor;
    }

    let query = Cake.find(filter).sort({ createdAt: -1 });

    // suggestion dropdown limit
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const cakes = await query;

    res.status(200).json({
      success: true,
      count: cakes.length,
      data: cakes
    });

  } catch (error) {

    console.error("Get Cakes Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

// GET SINGLE CAKE
const getSingleCake = async (req, res) => {
  try {

    const cake = await Cake.findById(req.params.id);

    if (!cake) {
      return res.status(404).json({
        success: false,
        message: "Cake not found"
      });
    }

    res.json({
      success: true,
      data: cake
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }
};

module.exports = {
  addCake,
  getCakes,
  getSingleCake
};