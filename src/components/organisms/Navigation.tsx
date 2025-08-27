import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/components/atoms';
import { NavigationItem, CartWithIcon } from '@/components/molecules';
import { UserMenu } from '../UserMenu';
import { HomeIcon } from '../HomeIcon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/atoms';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const closeSheet = () => setIsOpen(false);

  const handleLogin = () => {
    setShowLoginModal(false);
    navigate('/auth');
  };

  const handleContinueWithoutLogin = () => {
    setShowLoginModal(false);
    navigate('/menu');
  };

  const navigationItems = [
    { to: '/menu', label: 'Menu' },
    { to: '/rewards', label: 'Rewards' },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <HomeIcon />
            <span className="text-xl font-bold">TapCheck</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <NavigationItem key={item.to} to={item.to}>
                {item.label}
              </NavigationItem>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/menu">
              <CartWithIcon />
            </Link>
            <UserMenu onLoginClick={() => setShowLoginModal(true)} />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/menu">
              <CartWithIcon />
            </Link>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <NavigationItem 
                      key={item.to} 
                      to={item.to} 
                      onClick={closeSheet}
                      className="block py-2 text-lg"
                    >
                      {item.label}
                    </NavigationItem>
                  ))}
                  <div className="pt-4 border-t">
                    <UserMenu onLoginClick={() => setShowLoginModal(true)} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="bg-gray-900 border border-purple-400/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-yellow-400">
              Unlock Exclusive Benefits
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300 mt-4">
              Login to access member discounts, personalized recommendations, and exclusive offers available only to registered users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 mt-6">
            <Button 
              onClick={handleLogin}
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-full"
            >
              Login for Discounts & Offers
            </Button>
            <Button 
              variant="outline" 
              onClick={handleContinueWithoutLogin}
              className="border-gray-400/50 text-gray-900 hover:bg-gray-400/10 rounded-full"
            >
              Continue Shopping Without Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
};