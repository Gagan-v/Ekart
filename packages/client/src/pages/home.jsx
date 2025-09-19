import { useState, useEffect } from "react";
import Carousel from "../components/Carousel";
import { fetchLandingSections } from "../api/strapi";

const Home = () => {
  const slides = [
    {
      text: "Image 1",
      bgColor: "#1abc9c",
      heading: "Big Summer Sale",
      subheading: "Up to 50% off",
    },
    {
      text: "Image 2",
      bgColor: "#e74c3c",
      heading: "Fresh Arrivals",
      subheading: "Trending this week",
    },
    {
      text: "Image 3",
      bgColor: "#3498db",
      heading: "Member Exclusives",
      subheading: "Join EKART+",
    },
  ];
  const [landingData, setLandingData] = useState([]);
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchLandingSections(); //call api
        console.log("fetched data:", data);
        setLandingData(data); //store entries in state
      } catch (err) {
        console.log("Error fetching landing data:", err);
      }
    };
    getData();
  }, []); // empty array → run once on mount
  const getDescriptionText = (descArray) => {
    if (!descArray || descArray.length === 0) return "";
    return descArray
      .map((block) => block.children?.map((child) => child.text).join("") || "")
      .join("\n");
  };
  return (
    <div className="home">
      <div className="mt-16">
        <Carousel slides={slides} autoplay interval={5000} />
      </div>

      {/* Welcome Section */}
      <div className="py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to eKart 🛒
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Shop with confidence
            and enjoy fast delivery to your doorstep.
          </p>
        </div>
      </div>

      {/* Landing Sections */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {landingData.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 text-lg">
                Loading amazing content...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {landingData.map((item) => {
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    {item.Image && item.Image.length > 0 && (
                      <div className="aspect-w-16 aspect-h-9">
                        <img
                          src={`http://localhost:1337${
                            item.Image[0].formats?.small?.url ||
                            item.Image[0].url
                          }`}
                          alt={item.Image[0].alternativeText || item.Title}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {item.Title}
                      </h2>
                      <p className="text-gray-600 leading-relaxed">
                        {getDescriptionText(item.Description)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
