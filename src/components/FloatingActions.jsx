import { ArrowUp, Camera, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed bottom-24 right-4 z-40 grid gap-3 md:bottom-6">
      <a href="https://wa.me/919999999999" className="grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-xl" aria-label="WhatsApp"><MessageCircle /></a>
      <a href="https://instagram.com" className="grid h-12 w-12 place-items-center rounded-full rose-gradient text-[#1A1A1A] shadow-xl" aria-label="Instagram"><Camera /></a>
      {showTop && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="grid h-12 w-12 place-items-center rounded-full bg-[#1A1A1A] text-white shadow-xl" aria-label="Back to top"><ArrowUp /></button>}
    </div>
  );
}
