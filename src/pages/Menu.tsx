import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { HomeIcon } from "@/components/HomeIcon";
import { AgeVerificationModal } from "@/components/AgeVerificationModal";
import { CartSummary } from "@/components/CartSummary";
import { Button } from "@/components/ui/button";
import { useEnhancedCart } from "@/hooks/useEnhancedCart";
import { useMenuData } from "@/hooks/useMenuData";
import { useAgeVerification } from "@/hooks/useAgeVerification";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { useAbandonedCart } from "@/hooks/useAbandonedCart";
import { useAuth } from "@/hooks/useAuth";
import { MenuHero } from "@/components/menu/MenuHero";
import { VenueSearch } from "@/components/menu/VenueSearch";
import { FeaturedProductsSection } from "@/components/menu/FeaturedProductsSection";
import { CategorySelector } from "@/components/menu/CategorySelector";
import { ProductsGrid } from "@/components/menu/ProductsGrid";

const SELECTED_VENUE_KEY = 'selected_venue';

const getStoredVenue = (): { id: string; name: string } | null => {
  try {
    const stored = localStorage.getItem(SELECTED_VENUE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const Menu = () => {
  const navigate = useNavigate();
  const storedVenue = getStoredVenue();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(storedVenue?.id || null);
  const [selectedVenueName, setSelectedVenueName] = useState<string>(storedVenue?.name || '');
  const [showVenueSearch, setShowVenueSearch] = useState<boolean>(!storedVenue);
  
  const { user } = useAuth();
  const { cart, addToCart, removeFromCart, getCartItemQuantity, cartTotal, cartItemCount, deleteFromCart } = useEnhancedCart({
    userId: user?.id,
    selectedVenueId: selectedVenue,
  });
  
  const { categories, products, loading } = useMenuData(selectedVenue);
  const { showAgeVerification, handleAgeVerified } = useAgeVerification();
  const { selectedCategory, setSelectedCategory, filteredProducts, featuredProducts } = useCategoryFilter(categories, products);
  const { clearAbandonedCartTimers } = useAbandonedCart({ 
    cartItemCount, 
    onNudgeClick: () => navigate("/checkout") 
  });

  const handleCheckout = () => {
    clearAbandonedCartTimers();
    navigate('/checkout');
  };

  const handleVenueSelect = (venueId: string, venueName: string) => {
    setSelectedVenue(venueId);
    setSelectedVenueName(venueName);
    setShowVenueSearch(false);
    
    // Persist to localStorage
    localStorage.setItem(SELECTED_VENUE_KEY, JSON.stringify({ id: venueId, name: venueName }));
  };

  const handleClearCart = () => {
    cart.forEach(item => deleteFromCart(item.product.id));
  };

  const clearVenueSelection = () => {
    setSelectedVenue(null);
    setSelectedVenueName('');
    localStorage.removeItem(SELECTED_VENUE_KEY);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Navigation />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-white text-xl">Loading menu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <HomeIcon />
      <Navigation />
      
      <AgeVerificationModal 
        open={showAgeVerification} 
        onVerified={handleAgeVerified} 
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <MenuHero />

        {showVenueSearch && (
          <VenueSearch 
            onVenueSelect={handleVenueSelect}
            selectedVenueId={selectedVenue}
            cartItemCount={cartItemCount}
            onClearCart={handleClearCart}
          />
        )}

        {selectedVenue && selectedVenueName && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              Menu of {selectedVenueName}
            </h2>
            <Button
              onClick={() => setShowVenueSearch(true)}
              variant="outline"
              className="bg-transparent border-purple-500/50 text-purple-300 hover:bg-purple-500/20 hover:text-white"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Change Venue
            </Button>
          </div>
        )}

        <FeaturedProductsSection
          featuredProducts={featuredProducts}
          getCartItemQuantity={getCartItemQuantity}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />

        <CategorySelector
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        <ProductsGrid
          filteredProducts={filteredProducts}
          categories={categories}
          selectedCategory={selectedCategory}
          getCartItemQuantity={getCartItemQuantity}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
        />

        <CartSummary
          itemCount={cartItemCount}
          total={cartTotal}
          onCheckout={handleCheckout}
        />
      </div>

      <Footer />
    </div>
  );
};

export default Menu;