import { useState } from "react";

export default function ProductImageGallery({ product, compact = false }) {
  const images = product.imageUrls?.length
    ? product.imageUrls
    : [...new Set([product.imageUrl, product.image1, product.image2, product.image3, product.image4].filter(Boolean))];
  const [selected, setSelected] = useState(0);
  const active = selected < images.length ? selected : 0;

  return (
    <div className={compact ? "bg-white p-4 pb-0" : "bg-white"}>
      <div className={`relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-white ${compact ? "h-56" : "h-80 sm:h-96"}`}>
        {images.length ? (
          <img src={images[active]} alt={`${product.title}, image ${active + 1}`}
            className="h-full w-full object-contain p-4" loading={compact ? "lazy" : "eager"} />
        ) : <p className="text-sm text-gray-500">No image available</p>}
        {images.length > 1 && <span className="absolute bottom-2 right-2 rounded-full bg-white px-2 py-1 text-xs text-gray-600 shadow-sm" aria-live="polite">
          {active + 1} / {images.length}
        </span>}
      </div>
      {images.length > 0 && (
        <div className="mt-3 flex gap-2" role="group" aria-label={`${product.title} images`}>
          {images.map((url, index) => (
            <button key={url} type="button" aria-label={`Show ${product.title} image ${index + 1}`}
              aria-pressed={active === index}
              onClick={(event) => { event.stopPropagation(); setSelected(index); }}
              className={`flex min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg border-2 bg-white p-1 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${compact ? "h-14" : "h-20"} ${active === index ? "border-blue-600" : "border-gray-200 hover:border-blue-300"}`}>
              <img src={url} alt={`${product.title}, thumbnail ${index + 1}`} className="h-full w-full object-contain" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
