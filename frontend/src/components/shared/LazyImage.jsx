import { useState, useEffect } from "react";
import { getImageUrl } from "@/lib/api";

export default function LazyImage({ src, alt, className = "", ...props }) {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState("");

  useEffect(() => {
    setLoaded(false);
    const resolvedUrl = getImageUrl(src);
    if (!resolvedUrl) {
      setCurrentSrc("");
      return;
    }
    const img = new Image();
    img.src = resolvedUrl;
    img.onload = () => {
      setCurrentSrc(resolvedUrl);
      setLoaded(true);
    };
    img.onerror = () => {
      setCurrentSrc(resolvedUrl);
      setLoaded(true);
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden bg-secondary ${className}`}>
      {/* Loading Skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-pink-50 via-pink-100/50 to-pink-50 flex items-center justify-center">
          <span className="text-[10px] text-pink-300 font-semibold tracking-wider uppercase">Loading Sweetness...</span>
        </div>
      )}
      
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-opacity duration-700 ease-in-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
}
