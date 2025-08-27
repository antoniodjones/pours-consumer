import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileNavItemProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const ProfileNavItem: React.FC<ProfileNavItemProps> = ({
  icon: Icon,
  label,
  isActive,
  onClick,
  className
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-left w-full transition-colors",
        isActive 
          ? "bg-primary/10 text-primary border-l-4 border-primary" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
    </button>
  );
};