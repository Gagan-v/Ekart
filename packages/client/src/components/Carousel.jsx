import { useEffect, useState } from "react";

const Carousel = ({ slides, autoplay = true, interval, loop = true }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const len = slides.length;

  // Autoplay logic
  useEffect(() => {
    if (!autoplay || len <= 1) return;

    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev === len - 1) return loop ? 0 : prev;
        return prev + 1;
      });
    }, interval);

    return () => clearInterval(id);
  }, [autoplay, interval, loop, len]);

  // navigation
  const goToNext = () =>
    setCurrentIndex((prev) =>
      prev === len - 1 ? (loop ? 0 : prev) : prev + 1
    );

  const goToPrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? (loop ? len - 1 : 0) : prev - 1));

  const goToSlide = (i) => setCurrentIndex(i);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500 bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-xl">No slides available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl shadow-2xl mx-auto max-w-7xl">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full flex flex-col items-start justify-center px-12 text-white transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105 pointer-events-none"
          }`}
          style={{
            backgroundColor: slide.bgColor,
            backgroundImage: slide.image ? `url(${slide.image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl border border-white/20 shadow-2xl">
            <div className="text-sm uppercase opacity-90 tracking-wider font-semibold mb-3 text-blue-200">
              {slide.text}
            </div>
            {slide.heading && (
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {slide.heading}
              </h2>
            )}
            {slide.subheading && (
              <p className="text-xl md:text-2xl font-light text-blue-50">
                {slide.subheading}
              </p>
            )}
          </div>
        </div>
      ))}

      {/* Previous Button - Center Left */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-6 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white/30 backdrop-blur-sm"
        style={{
          zIndex: 50,
          position: "absolute",
          top: "50%",
          left: "24px",
          transform: "translateY(-50%)",
        }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {/* Next Button - Center Right */}
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-6 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 border-2 border-white/30 backdrop-blur-sm"
        style={{
          zIndex: 50,
          position: "absolute",
          top: "50%",
          right: "24px",
          transform: "translateY(-50%)",
        }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Slide Indicators - Bottom Center */}
      <div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3"
        style={{ zIndex: 50 }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`transition-all duration-300 rounded-full border-2 ${
              idx === currentIndex
                ? "w-8 h-3 bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400 shadow-lg"
                : "w-3 h-3 bg-white/60 hover:bg-white/80 border-white/40 hover:border-white/60 hover:scale-110"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
