import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/atoms';
import { useCart } from '@/hooks/useCart';

export const CartWithIcon: React.FC = () => {
  const { cartItemCount } = useCart();
  const totalItems = cartItemCount;

  return (
    <div className="relative">
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {totalItems}
        </Badge>
      )}
    </div>
  );
};