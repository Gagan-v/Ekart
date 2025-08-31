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
      <Carousel slides={slides} autoplay interval={5000} />
      <h1 className="underline">Welcome to eKart 🛒</h1>
      <div className="landingstrapi">
        {landingData.length === 0 ? (
          <p>Loading......</p>
        ) : (
          landingData.map((item) => {
            return (
              <div className="" key={item.id}>
                <h2 className="text-2xl font-bold">{item.Title}</h2>
                <p className="text-gray-700">
                  {getDescriptionText(item.Description)}
                </p>
                {item.Image && item.Image.length > 0 && (
                  <img
                    src={`http://localhost:1337${
                      item.Image[0].formats?.small?.url || item.Image[0].url
                    }`}
                    alt={item.Image[0].alternativeText || item.Title}
                    className="mt-2 rounded-lg shadow-md"
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home;
