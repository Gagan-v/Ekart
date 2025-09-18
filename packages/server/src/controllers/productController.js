const Product = require("../model/Product.js");

export const createProduct = async (req, res) => {
  try {
    const { category, subCategory, title, price, specs } = req.body;
    //we need to run conditions before creating the product
    if (!category || !subCategory || !title || price == null) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    // Accept specs as array or multiline string (convert to array)
    const specsArray = Array.isArray(specs)
      ? specs
      : typeof specs === "string"
        ? specs
            .split("\n")
            .map((s) => s.replace(/^•\s*/, "").trim())
            .filter(Boolean)
        : [];

    const product = await Product.create({
      category,
      subCategory,
      title,
      price: Number(price),
      specs: specsArray,
      imageUrl: imageUrl || "",
      createdBy: req.user?.id,
    });
    return res.status(201).json(product);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "server error while getting" });
  }
};

export const getproduct = async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) {
      return res.staus(404).json({ message: "Product not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "server error" });
  }
};
