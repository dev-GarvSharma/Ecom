import { Bell, Heart, LogOut, MapPin, Package, RotateCcw, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import { orders } from '../data/products.js';

export default function Profile() {
  const cards = [
    [Package, 'My Orders', `${orders.length} recent orders`, '/orders'],
    [Heart, 'Wishlist', 'Saved favourites', '/wishlist'],
    [MapPin, 'Saved Addresses', 'Home and studio address', '#'],
    [Bell, 'Notifications', 'Drop alerts and offers', '#'],
    [RotateCcw, 'Returns', 'Refund history', '#'],
    [UserRound, 'Profile Edit', 'Name, phone and email', '#'],
  ];

  return (
    <>
      <Seo title="Profile" description="Manage Velvet Spice orders, addresses, wishlist and account details." />
      <Section eyebrow="Dashboard" title="Your boutique profile">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-3xl bg-[#1A1A1A] p-6 text-[#FFF8F5] shadow-xl">
            <div className="grid h-20 w-20 place-items-center rounded-full rose-gradient text-3xl font-bold text-[#1A1A1A]">VS</div>
            <h2 className="mt-5 font-display text-4xl">Hi, Shikha</h2>
            <p className="mt-2 text-white/60">Gold tier member</p>
            <button className="mt-8 flex items-center gap-2 rounded-full bg-white/10 px-5 py-3 font-bold"><LogOut size={18} /> Logout</button>
          </aside>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map(([Icon, title, text, to]) => (
              <Link key={title} to={to} className="rounded-3xl bg-white/60 p-6 shadow-lg transition hover:-translate-y-1 dark:bg-white/5">
                <Icon className="text-[#D4A373]" />
                <h3 className="mt-4 font-display text-3xl">{title}</h3>
                <p className="mt-2 text-sm opacity-65">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
