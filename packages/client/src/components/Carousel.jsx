import { useEffect, useState } from "react";

const Carousel = ({
  slides,
  autoplay = true,
  interval = 10000,
  loop = true,
}) => {
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

  // It should not be before useEffect because hooks must run consistently
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

      {/* Prev / Next */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white z-10"
        >
          ❮
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 p-2 rounded-full text-white z-10"
        >
          ❯
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
