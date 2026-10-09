import { Grid2X2, Heart, Home, ShoppingBag, UserRound } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const items = [
  ['Home', '/', Home],
  ['Categories', '/shop', Grid2X2],
  ['Wishlist', '/wishlist', Heart],
  ['Cart', '/cart', ShoppingBag],
  ['Profile', '/profile', UserRound],
];

export default function MobileBottomNav() {
  const count = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0));
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-2xl border border-[#D4A373]/20 bg-[#FFF8F5]/92 p-2 shadow-2xl backdrop-blur md:hidden dark:bg-[#1A1A1A]/92">
      {items.map(([label, to, Icon]) => (
        <NavLink key={to} to={to} className={({ isActive }) => `relative grid place-items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold ${isActive ? 'bg-[#F7D6E0] text-[#1A1A1A]' : 'opacity-70'}`}>
          <Icon size={18} />
          <span>{label}</span>
          {label === 'Cart' && count > 0 && <span className="absolute right-2 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#D4A373] px-1 text-[9px] text-[#1A1A1A]">{count}</span>}
        </NavLink>
      ))}
    </nav>
  );
}
