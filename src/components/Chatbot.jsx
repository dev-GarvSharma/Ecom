import { Bot, Send } from 'lucide-react';
import { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-24 left-4 z-40 md:bottom-6">
      {open && (
        <div className="mb-3 w-72 rounded-3xl border border-[#D4A373]/20 bg-[#FFF8F5] p-4 shadow-2xl dark:bg-[#1A1A1A]">
          <p className="font-display text-2xl">Spice Stylist</p>
          <div className="mt-3 rounded-2xl bg-white/70 p-3 text-sm dark:bg-white/10">Tell me your outfit vibe and I will suggest earrings, stacks or chokers.</div>
          <div className="mt-3 flex rounded-full bg-white/80 p-1 dark:bg-white/10"><input className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" placeholder="Pink saree..." /><button className="grid h-9 w-9 place-items-center rounded-full rose-gradient"><Send size={15} /></button></div>
        </div>
      )}
      <button onClick={() => setOpen(!open)} className="grid h-14 w-14 place-items-center rounded-full bg-[#1A1A1A] text-[#FFF8F5] shadow-2xl" aria-label="Open AI stylist"><Bot /></button>
    </div>
  );
}
