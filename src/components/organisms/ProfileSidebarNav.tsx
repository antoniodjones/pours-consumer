import React from 'react';
import { 
  User, 
  BarChart3, 
  Settings, 
  CreditCard, 
  Lock, 
  Gift,
  Fingerprint,
  Clock
} from 'lucide-react';
import { ProfileNavItem } from '@/components/molecules';

interface ProfileSidebarNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigationItems = [
  { id: 'summary', label: 'Profile Summary', icon: User },
  { id: 'dashboard', label: 'Account Dashboard', icon: BarChart3 },
  { id: 'profile', label: 'Manage Profile', icon: Settings },
  { id: 'orders', label: 'Order History', icon: Clock },
  { id: 'payments', label: 'Manage Payments', icon: CreditCard },
  { id: 'password', label: 'Update Password', icon: Lock },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'biometrics', label: 'Biometric Settings', icon: Fingerprint },
];

export const ProfileSidebarNav: React.FC<ProfileSidebarNavProps> = ({
  activeSection,
  onSectionChange
}) => {
  return (
    <nav className="space-y-2">
      {navigationItems.map((item) => (
        <ProfileNavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          isActive={activeSection === item.id}
          onClick={() => onSectionChange(item.id)}
        />
      ))}
    </nav>
  );
};