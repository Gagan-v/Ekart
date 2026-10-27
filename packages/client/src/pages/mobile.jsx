import { useState, useEffect } from "react";

import axios from "axios";

const Mobile = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("image1");

  useEffect(() => {
    const fetchMobileProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/admin/products"
        );
        // Filter products where category is "mobile"
        const mobileProducts = response.data.filter(
          (product) => product.category === "mobile"
        );
        setProducts(mobileProducts);
      } catch (err) {
        setError("Failed to fetch mobile products");
        console.error("Error fetching mobile products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMobileProducts();
  }, []);

  // Add product to cart function
  const addToCart = async (product) => {
    if (!product || !product._id) {
      alert("Invalid product data");
      return;
    }

    const user = JSON.parse(localStorage.getItem("authUser") || "null");
    const productId = product._id;
    if (user?.id) {
      // Logged in: persist to backend cart tied to this user
      try {
        const res = await fetch("http://localhost:5000/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id, // session-like user identification; no JWT
          },
          body: JSON.stringify({ productId, quantity: 1 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to add to cart");
        // Sync local cart with backend response (now includes full product details)
        const cartData = Array.isArray(data.cart) ? data.cart : [];
        localStorage.setItem("cart", JSON.stringify(cartData));
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`${product.title || "Product"} added to cart!`);
      } catch (err) {
        console.error("Failed to add to cart:", err);
        alert(err.message || "Failed to add to cart");
      }
    } else {
      // Not logged in: keep cart local only
      try {
        const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const validCart = Array.isArray(existingCart) ? existingCart : [];
        const idx = validCart.findIndex((item) => item?.id === productId);
        if (idx >= 0) {
          validCart[idx].quantity = (validCart[idx].quantity || 1) + 1;
        } else {
          validCart.push({
            id: productId,
            quantity: 1,
            title: product.title || "Unknown Product",
            price: product.price || 0,
            image1: product.image1 || "",
            category: product.category || "mobile",
          });
        }
        localStorage.setItem("cart", JSON.stringify(validCart));
        window.dispatchEvent(new Event("cartUpdated"));
        alert(`${product.title || "Product"} added to cart!`);
      } catch (err) {
        console.error("Failed to add to cart locally:", err);
        alert("Failed to add to cart");
      }
    }
  };

  // Handle product click to show detailed view
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setSelectedImage("image1");
  };

  // Close product detail modal
  const closeProductDetail = () => {
    setSelectedProduct(null);
    setSelectedImage("image1");
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          ★
        </span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400">
          ☆
        </span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300">
          ★
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">
              Loading mobile products...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mobile Phones
          </h1>
          <p className="text-gray-600">
            Discover the latest mobile phones with cutting-edge technology
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Mobile Products Available
            </h3>
            <p className="text-gray-500">
              Check back later for new mobile phone arrivals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => handleProductClick(product)}
              >
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 flex items-center justify-center">
                  {product.image1 || product.imageUrl ? (
                    <img
                      src={product.image1 || product.imageUrl}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">📱</div>
                        <p className="text-gray-500 text-sm">image1</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {product.title}
                  </h3>

                  {/* Rating */}
                  {product.averageRating > 0 && (
                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {renderStars(product.averageRating)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        ({product.reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specs && product.specs.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">
                        Key Features:
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {product.specs.slice(0, 3).map((spec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            <span className="line-clamp-1">{spec}</span>
                          </li>
                        ))}
                        {product.specs.length > 3 && (
                          <li className="text-gray-500 text-xs">
                            +{product.specs.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Price and Stock */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-green-600">
                        ₹{product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.stock > 0 ? (
                        <span className="text-green-600 font-medium">
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="text-red-500 font-medium">
                          Out of stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      product.stock > 0
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Close Button */}
                <button
                  onClick={closeProductDetail}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side - Product Images */}
                  <div>
                    {/* Main Product Image */}
                    <div className="mb-4">
                      <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden">
                        {selectedProduct[selectedImage] ||
                        selectedProduct.imageUrl ? (
                          <img
                            src={
                              selectedProduct[selectedImage] ||
                              selectedProduct.imageUrl
                            }
                            alt={selectedImage}
                            className="w-full h-96 object-cover"
                          />
                        ) : (
                          <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-6xl text-gray-400 mb-2">
                                📱
                              </div>
                              <p className="text-gray-500">{selectedImage}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail Images */}
                    <div className="grid grid-cols-3 gap-2">
                      {["image1", "image2", "image3", "image4"].map(
                        (imageKey) => (
                          <button
                            key={imageKey}
                            onClick={() => setSelectedImage(imageKey)}
                            className={`aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border-2 ${
                              selectedImage === imageKey
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                          >
                            {selectedProduct[imageKey] ? (
                              <img
                                src={selectedProduct[imageKey]}
                                alt={imageKey}
                                className="w-full h-20 object-cover"
                              />
                            ) : (
                              <div className="w-full h-20 bg-gray-200 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-2xl text-gray-400">
                                    📱
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {imageKey}
                                  </p>
                                </div>
                              </div>
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Right Side - Product Details */}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                      {selectedProduct.title}
                    </h2>

                    {/* Rating and Reviews */}
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {renderStars(selectedProduct.averageRating || 0)}
                        </div>
                        <span className="ml-2 text-lg font-semibold text-gray-700">
                          {selectedProduct.averageRating || 0}/5
                        </span>
                        <span className="ml-2 text-gray-600">
                          ({selectedProduct.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Be the first to review this product!
                      </p>
                    </div>

                    {/* Specifications */}
                    {selectedProduct.specs &&
                      selectedProduct.specs.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-800 mb-3">
                            Specifications:
                          </h3>
                          <ul className="space-y-2">
                            {selectedProduct.specs.map((spec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-2 mt-1">
                                  •
                                </span>
                                <span className="text-gray-700">{spec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-green-600">
                        ₹{selectedProduct.price.toLocaleString()}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedProduct.stock > 0 ? (
                          <span className="text-green-600">
                            {selectedProduct.stock} in stock
                          </span>
                        ) : (
                          <span className="text-red-500">Out of stock</span>
                        )}
                      </p>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => {
                        addToCart(selectedProduct);
                        closeProductDetail();
                      }}
                      className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                        selectedProduct.stock > 0
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                      disabled={selectedProduct.stock === 0}
                    >
                      {selectedProduct.stock > 0
                        ? "Add to Cart"
                        : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mobile;
