import { CreditCard, Landmark, Truck } from 'lucide-react';
import { useSelector } from 'react-redux';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import { currency } from '../utils/format.js';
import { resolveImageUrl } from '../utils/image.js';

export default function Checkout() {
  const items = useSelector((state) => state.cart.items);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <>
      <Seo title="Checkout" description="Complete your Velvet Spice jewellery order with secure checkout." />
      <Section eyebrow="Secure checkout" title="Almost yours">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <form className="grid gap-5 rounded-3xl bg-white/60 p-6 shadow-xl dark:bg-white/5">
            <Block title="Shipping Address">
              <div className="grid gap-3 sm:grid-cols-2"><Input placeholder="First name" /><Input placeholder="Last name" /><Input placeholder="Phone number" /><Input placeholder="Email" /><Input placeholder="Address line" wide /><Input placeholder="City" /><Input placeholder="PIN code" /></div>
            </Block>
            <Block title="Payment Method">
              <div className="grid gap-3 sm:grid-cols-3">
                <Pay icon={<CreditCard />} title="Card / UPI" />
                <Pay icon={<Landmark />} title="Razorpay UI" />
                <Pay icon={<Truck />} title="COD" />
              </div>
            </Block>
            <Block title="Coupon">
              <div className="flex rounded-full bg-[#FFF8F5] p-1 dark:bg-white/10"><input className="min-w-0 flex-1 bg-transparent px-4 outline-none" placeholder="VELVET10" /><button className="rounded-full bg-[#1A1A1A] px-5 py-2 font-bold text-white">Apply</button></div>
            </Block>
            <button className="rounded-full rose-gradient px-7 py-3 font-bold text-[#1A1A1A]">Place Order</button>
          </form>
          <aside className="h-fit rounded-3xl bg-[#1A1A1A] p-6 text-[#FFF8F5] shadow-xl">
            <h2 className="font-display text-3xl">Order Summary</h2>
            <div className="mt-5 space-y-4">{items.map((item) => <div key={item.id} className="flex gap-3"><img src={resolveImageUrl(item.images[0])} alt={item.name} className="h-16 w-16 rounded-xl object-cover" /><div className="flex-1"><p className="font-semibold">{item.name}</p><p className="text-sm text-white/60">Qty {item.quantity}</p></div><span>{currency(item.price * item.quantity)}</span></div>)}</div>
            <div className="my-5 border-t border-white/10" />
            <div className="flex justify-between text-xl font-bold"><span>Total</span><span>{currency(subtotal)}</span></div>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Block({ title, children }) {
  return <section><h2 className="mb-3 font-display text-3xl">{title}</h2>{children}</section>;
}

function Input({ placeholder, wide }) {
  return <input className={`rounded-2xl border border-[#D4A373]/20 bg-white/75 px-4 py-3 outline-none dark:bg-white/10 ${wide ? 'sm:col-span-2' : ''}`} placeholder={placeholder} />;
}

function Pay({ icon, title }) {
  return <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#D4A373]/20 bg-white/70 p-4 dark:bg-white/10"><input type="radio" name="pay" className="accent-[#D4A373]" /> <span className="text-[#D4A373]">{icon}</span><span className="font-semibold">{title}</span></label>;
}
