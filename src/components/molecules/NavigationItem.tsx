import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationItemProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ 
  to, 
  children, 
  className,
  onClick 
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "text-foreground hover:text-primary transition-colors",
        isActive && "text-primary font-medium",
        className
      )}
    >
      {children}
    </Link>
  );
};