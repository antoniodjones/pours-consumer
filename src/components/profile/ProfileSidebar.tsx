import React, { useState } from 'react';
import { User, Lock, Settings, BarChart3, ShoppingBag, CreditCard, Activity, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: 'summary', label: 'Profile Summary', icon: User },
  { id: 'dashboard', label: 'Account Dashboard', icon: BarChart3 },
  { id: 'orders-history', label: 'Orders History', icon: ShoppingBag },
  { id: 'rewards', label: 'Rewards', icon: BarChart3 },
  { id: 'manage', label: 'Manage Profile', icon: Settings },
  { id: 'biometrics', label: 'Biometric Settings', icon: Activity },
  { id: 'manage-payments', label: 'Manage Payments', icon: CreditCard },
  { id: 'password', label: 'Manage Password', icon: Lock },
];

export const ProfileSidebar = ({ activeSection, onSectionChange }: ProfileSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Profile</h2>
        <p className="text-gray-400 text-sm sm:text-base">Manage your account settings</p>
      </div>
      
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start text-left text-sm sm:text-base ${
                isActive 
                  ? 'bg-purple-500/20 text-white border border-purple-500/30' 
                  : 'text-gray-300 hover:text-white hover:bg-purple-500/10'
              }`}
              onClick={() => handleSectionChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </Button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <div className="bg-black/40 backdrop-blur-sm border-b border-purple-500/20 p-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-black/90 backdrop-blur-sm border-purple-500/20 p-6">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-black/40 backdrop-blur-sm border-r border-purple-500/20 min-h-screen p-6">
        <SidebarContent />
      </div>
    </>
  );
};