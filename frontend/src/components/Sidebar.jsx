import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity,
  Utensils,
  TrendingUp,
  Pill,
  Clock,
  User,
} from 'lucide-react';

export function MobileNav() {
  const location = useLocation();

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Meal', path: '/log-meal', icon: Utensils },
    { name: 'Predict', path: '/predict-glucose', icon: TrendingUp },
    { name: 'Meds', path: '/medication', icon: Pill },
    { name: 'Progress', path: '/progress', icon: Clock },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8EDF3] py-2 px-2 shadow-[0_-2px_10px_rgba(7,26,51,0.04)]">
      <div className="flex items-center justify-around">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-[#B52B3A] font-semibold'
                  : 'text-[#708198] hover:text-[#071A33]'
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${
                  isActive ? 'text-[#B52B3A] stroke-[2.2]' : 'text-[#708198]'
                }`}
              />
              <span className="truncate">{link.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
