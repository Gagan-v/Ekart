import Button from "@mui/material/Button";
import Carousel from "../components/Carousel";

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
  return (
    <div className="home">
      <Carousel slides={slides} autoplay interval={4000} />
      <h1 className="underline">Welcome to eKart 🛒</h1>
      <Button variant="contained">Hurayy!!!!</Button>
    </div>
  );
};

export default Home;
