import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBestSellers,
  fetchTodaySpecials,
  fetchTrendingProducts,
  fetchCategories,
  fetchOccasions,
} from "@/features/products/productSlice";

// Home Components (Desktop)
import HeroBanner from "@/components/home/HeroBanner";
import CategorySection from "@/components/home/CategorySection";
import OccasionSection from "@/components/home/OccasionSection";
import ProductSlider from "@/components/home/ProductSlider";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import SpecialOffers from "@/components/home/SpecialOffers";
import InstagramGallery from "@/components/home/InstagramGallery";
import FAQSection from "@/components/home/FAQSection";

// Mobile Components
import MobileCategorySlider from "@/components/home/mobile/MobileCategorySlider";
import MobileOccasionSlider from "@/components/home/mobile/MobileOccasionSlider";
import MobileTrendingSlider from "@/components/home/mobile/MobileTrendingSlider";
import MobileBestSellerSlider from "@/components/home/mobile/MobileBestSellerSlider";
import MobileTestimonials from "@/components/home/mobile/MobileTestimonials";

export default function Home() {
  const dispatch = useDispatch();
  const { bestSellers, todaySpecials, trending, categories, occasions, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchBestSellers());
    dispatch(fetchTodaySpecials());
    dispatch(fetchTrendingProducts(4));
    dispatch(fetchCategories());
    dispatch(fetchOccasions());
  }, [dispatch]);

  return (
    <div className="bg-background text-foreground transition-colors duration-500 min-h-screen">
      <HeroBanner />
      
      {/* Desktop Sections */}
      <div className="hidden md:block">
        <CategorySection />
        <OccasionSection />
        
        {!loading && bestSellers.length > 0 && (
          <ProductSlider 
            title="Sweet Best Sellers" 
            subtitle="Our Favorites" 
            products={bestSellers} 
            viewAllLink="/shop" 
          />
        )}
      </div>

      {/* Mobile Sections */}
      <div className="block md:hidden">
        <MobileCategorySlider categories={categories} loading={loading} />
        <MobileOccasionSlider occasions={occasions} loading={loading} />
        {!loading && bestSellers.length > 0 && (
          <MobileBestSellerSlider products={bestSellers} />
        )}
      </div>

      <WhyChooseUs />
      
      <div className="hidden md:block">
        {trending.length > 0 && (
          <ProductSlider 
            title="Trending Right Now" 
            subtitle="Fresh Out The Oven" 
            products={trending} 
          />
        )}
      </div>

      <div className="block md:hidden">
        {trending.length > 0 && (
          <MobileTrendingSlider products={trending} />
        )}
      </div>
      
      <HowItWorks />
      
      {!loading && todaySpecials.length > 0 && (
        <SpecialOffers todaysSpecials={todaySpecials} />
      )}
      
      <div className="hidden md:block">
        <Testimonials />
      </div>

      <div className="block md:hidden">
        <MobileTestimonials />
      </div>
      
      <InstagramGallery />
      
      <FAQSection />
    </div>
  );
}
