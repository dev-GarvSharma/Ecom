import { CheckCircle2, PackageCheck, Sparkles, Truck } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import { orders } from '../data/products.js';
import { currency } from '../utils/format.js';

export default function Orders() {
  return (
    <>
      <Seo title="Orders" description="Track Velvet Spice jewellery orders." />
      <Section eyebrow="Tracking" title="My Orders">
        <div className="space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-3xl bg-white/60 p-6 shadow-xl dark:bg-white/5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-display text-3xl">Order {order.id}</h2><p className="text-sm opacity-65">Placed {order.date} - ETA {order.eta}</p></div>
                <p className="font-bold text-[#D4A373]">{currency(order.total)}</p>
              </div>
              <div className="mt-7 grid gap-3 md:grid-cols-4">
                {['Processing', 'Packed', 'Shipped', 'Delivered'].map((step, index) => {
                  const active = order.status === 'Delivered' || index < 3;
                  const Icon = [Sparkles, PackageCheck, Truck, CheckCircle2][index];
                  return <div key={step} className={`rounded-2xl p-4 ${active ? 'rose-gradient text-[#1A1A1A]' : 'bg-white/70 opacity-50 dark:bg-white/10'}`}><Icon /><p className="mt-3 font-bold">{step}</p></div>;
                })}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
