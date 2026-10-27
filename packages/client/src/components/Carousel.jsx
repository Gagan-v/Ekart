import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";

/**
 * Modern eKart-style Carousel Component
 *
 * A fully reusable carousel component designed for e-commerce banners.
 * Features smooth transitions, autoplay, navigation controls, and slide indicators.
 *
 * @param {Array} slides - Array of slide objects with structure:
 *   - text: Small description text
 *   - heading: Main title
 *   - subheading: Secondary text
 *   - image: Background image URL
 *   - bgColor: Fallback background color
 * @param {boolean} autoplay - Enable/disable automatic slide progression
 * @param {number} interval - Time between slides in milliseconds
 * @param {boolean} loop - Whether to loop back to first slide after last
 */
const Carousel = ({
  slides,
  autoplay = true,
  interval = 5000,
  loop = true,
}) => {
  // currentIndex: State for tracking which slide is currently visible
  const [currentIndex, setCurrentIndex] = useState(0);
  const len = slides?.length || 0;

  // useEffect: Handles autoplay logic with cleanup
  useEffect(() => {
    // Don't start autoplay if disabled, no slides, or only one slide
    if (!autoplay || len <= 1) return;

    // Set up interval to automatically advance slides
    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        // If at last slide and loop is enabled, go to first slide
        if (prev === len - 1) return loop ? 0 : prev;
        // Otherwise, go to next slide
        return prev + 1;
      });
    }, interval);

    // Cleanup: Clear interval when component unmounts or dependencies change
    return () => clearInterval(id);
  }, [autoplay, interval, loop, len]);

  // goToNext: Function to navigate to the next slide
  const goToNext = () =>
    setCurrentIndex((prev) =>
      prev === len - 1 ? (loop ? 0 : prev) : prev + 1
    );

  // goToPrev: Function to navigate to the previous slide
  const goToPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? (loop ? len - 1 : 0) : prev - 1));

  // goToSlide: Function to jump directly to a specific slide
  const goToSlide = (i) => setCurrentIndex(i);

  // Handle empty slides array
  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[400px] sm:h-[500px] lg:h-[600px] flex items-center justify-center text-gray-500 bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-xl">No slides available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl shadow-2xl mx-auto max-w-7xl group"
      style={{ position: "relative", minWidth: "100%" }}
    >
      {/* Map through slides and render only the current one with fade animation */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full flex flex-col items-start justify-center px-6 sm:px-8 lg:px-12 text-white transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? "opacity-100 scale-100" // Current slide: fully visible and normal size
              : "opacity-0 scale-105 pointer-events-none" // Other slides: hidden and slightly larger
          }`}
          style={{
            // Background image with cover and center positioning
            backgroundColor: slide.bgColor,
            backgroundImage: slide.image ? `url(${slide.image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        >
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent"></div>

          {/* Left-aligned content container with hover shadow effect */}
          <div className="relative z-10 max-w-2xl transform hover:scale-105 transition-transform duration-300">
            {/* Small description text */}
            {slide.text && (
              <div className="text-sm uppercase opacity-90 tracking-wider font-semibold mb-3 text-blue-200">
                {slide.text}
              </div>
            )}

            {/* Main heading - big bold title */}
            {slide.heading && (
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {slide.heading}
              </h2>
            )}

            {/* Subheading - smaller secondary text */}
            {slide.subheading && (
              <p className="text-lg sm:text-xl md:text-2xl font-light text-blue-50 mb-6">
                {slide.subheading}
              </p>
            )}

            {/* Shop Now button - optional for later functionality */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Shop Now
            </button>
          </div>
        </div>
      ))}

      {/* Previous Button - Left center with custom arrow */}
      <IconButton
        onClick={goToPrev}
        sx={{
          position: "absolute",
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          color: "white",
          border: "2px solid rgba(255, 255, 255, 0.6)",
          width: 48,
          height: 48,
          zIndex: 60,
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            transform: "translateY(-50%) scale(1.1)",
          },
          transition: "all 0.3s ease",
          backdropFilter: "blur(8px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
        aria-label="Previous slide"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </IconButton>

      {/* Next Button - Right center with custom arrow */}
      <IconButton
        onClick={goToNext}
        sx={{
          position: "absolute",
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          color: "white",
          border: "2px solid rgba(255, 255, 255, 0.6)",
          width: 48,
          height: 48,
          zIndex: 60,
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            border: "2px solid rgba(255, 255, 255, 0.8)",
            transform: "translateY(-50%) scale(1.1)",
          },
          transition: "all 0.3s ease",
          backdropFilter: "blur(8px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
        aria-label="Next slide"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </IconButton>

      {/* Slide Indicators - Bottom center with small pills/dots and hover effect */}
      <div
        className="flex gap-2 items-center justify-center z-[60]"
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full border backdrop-blur-sm ${
              idx === currentIndex
                ? "w-8 h-3 bg-white/90 border-white/60 shadow-lg scale-110" // Current slide: highlighted pill
                : "w-3 h-3 bg-white/40 hover:bg-white/60 border-white/30 hover:border-white/50 hover:scale-110 shadow-md hover:shadow-lg" // Other slides: small dots
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
