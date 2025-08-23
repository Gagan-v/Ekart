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
      <div className="w-full h-[400px] flex items-center justify-center text-gray-500">
        No slides available
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full flex flex-col items-start justify-center px-8 text-white transition-opacity duration-700 ${
            index === currentIndex
              ? "opacity-100"
              : "opacity-0 pointer-events-none hidden"
          }`}
          style={{
            backgroundColor: slide.bgColor,
            backgroundImage: slide.image ? `url(${slide.image})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="text-xs uppercase opacity-90">{slide.text}</div>
          {slide.heading && (
            <h2 className="text-3xl font-bold">{slide.heading}</h2>
          )}
          {slide.subheading && (
            <p className="mt-2 text-lg">{slide.subheading}</p>
          )}
        </div>
      ))}

      {/* Prev Button */}
      <button
        onClick={goToPrev}
        style={{
          position: "absolute",
          top: "50%",
          left: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.3)",
          padding: "8px",
          borderRadius: "50%",
          color: "white",
          zIndex: 10,
        }}
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        onClick={goToNext}
        style={{
          position: "absolute",
          top: "50%",
          right: "16px",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.3)",
          padding: "8px",
          borderRadius: "50%",
          color: "white",
          zIndex: 10,
        }}
      >
        ❯
      </button>

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "8px",
          zIndex: 10,
        }}
      >
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor:
                idx === currentIndex ? "white" : "rgba(255,255,255,0.5)",
              border: "none",
              cursor: "pointer",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
