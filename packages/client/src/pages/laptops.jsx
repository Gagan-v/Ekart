import { useState, useEffect } from "react";
import axios from "axios";

const Laptops = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaptopProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/api/admin/products"
        );
        // Filter products where category is "laptop"
        // This replaces the previous filtering by subCategory === "laptop"
        const laptopProducts = response.data.filter(
          (product) => product.category === "laptop"
        );
        setProducts(laptopProducts);
      } catch (err) {
        setError("Failed to fetch laptop products");
        console.error("Error fetching laptop products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLaptopProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">
              Loading laptop products...
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Laptops</h1>
          <p className="text-gray-600">
            Find the perfect laptop for work, gaming, and everything in between
          </p>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">💻</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No Laptop Products Available
            </h3>
            <p className="text-gray-500">
              Check back later for new laptop arrivals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Product Image */}
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">💻</div>
                        <p className="text-gray-500 text-sm">
                          Image Coming Soon
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {product.title}
                  </h3>

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

                  {/* Add to Cart Button - Updated from "Buy Now" to "Add to Cart" */}
                  {/* Includes hover effects: scale transform and enhanced shadow */}
                  <button
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
      </div>
    </div>
  );
};

export default Laptops;
