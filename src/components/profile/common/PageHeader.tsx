import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconColor?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  iconColor = "text-yellow-400" 
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-800 to-purple-900 p-6 sm:p-8 rounded-t-lg border-b border-purple-500/20">
      <div className="flex items-center gap-3 sm:gap-4 mb-3">
        <Icon className={`h-8 w-8 sm:h-10 sm:w-10 ${iconColor}`} />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase">
          {title}
        </h1>
      </div>
      <p className="text-base sm:text-lg text-gray-300 font-light tracking-wide">
        {subtitle}
      </p>
    </div>
  );
};