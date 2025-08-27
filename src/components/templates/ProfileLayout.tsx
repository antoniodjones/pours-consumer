import React from 'react';
import { ProfileSidebarNav } from '@/components/organisms';
import { Sheet, SheetContent, SheetTrigger, Button } from '@/components/atoms';
import { Menu } from 'lucide-react';

interface ProfileLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const ProfileLayout: React.FC<ProfileLayoutProps> = ({
  children,
  activeSection,
  onSectionChange
}) => {
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <ProfileSidebarNav 
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
          </div>
        </aside>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="mb-4">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px]">
              <div className="mt-8">
                <ProfileSidebarNav 
                  activeSection={activeSection}
                  onSectionChange={onSectionChange}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};