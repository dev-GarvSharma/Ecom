import { useState } from 'react';
import Seo from '../components/Seo.jsx';

export default function Auth() {
  const [mode, setMode] = useState('login');
  return (
    <>
      <Seo title="Login" description="Login or create your Velvet Spice account." />
      <section className="mx-auto grid min-h-[calc(100vh-10rem)] max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
        <div className="hidden overflow-hidden rounded-3xl luxury-shadow lg:block"><img src="https://images.unsplash.com/photo-1506629905607-d9f297d00127?auto=format&fit=crop&w=1200&q=85" alt="Jewellery styling" className="h-[680px] w-full object-cover" /></div>
        <div className="rounded-3xl bg-white/60 p-6 shadow-2xl backdrop-blur dark:bg-white/5 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D4A373]">{mode === 'otp' ? 'Verification' : 'Members lounge'}</p>
          <h1 className="mt-3 font-display text-5xl">{mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset password' : mode === 'otp' ? 'Enter OTP' : 'Welcome back'}</h1>
          <div className="mt-7 grid gap-4">
            {mode === 'signup' && <Input placeholder="Full name" />}
            {mode !== 'otp' && <Input placeholder="Email address" />}
            {mode === 'login' || mode === 'signup' ? <Input placeholder="Password" type="password" /> : null}
            {mode === 'otp' && <div className="grid grid-cols-4 gap-3">{[1, 2, 3, 4].map((item) => <input key={item} maxLength="1" className="h-16 rounded-2xl bg-white text-center text-2xl font-bold outline-none dark:bg-white/10" />)}</div>}
            <button className="rounded-full rose-gradient px-6 py-3 font-bold text-[#1A1A1A]">{mode === 'otp' ? 'Verify OTP' : mode === 'forgot' ? 'Send OTP' : mode === 'signup' ? 'Sign up' : 'Login'}</button>
            <button className="flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3 font-bold shadow dark:bg-white/10"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#4285F4] text-xs text-white">G</span> Continue with Google</button>
            <button className="rounded-full bg-[#1A1A1A] px-6 py-3 font-bold text-white">Continue with Instagram</button>
          </div>
          <div className="mt-6 flex flex-wrap justify-between gap-3 text-sm font-semibold text-[#D4A373]">
            <button onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}>{mode === 'signup' ? 'Already have an account?' : 'Create new account'}</button>
            <button onClick={() => setMode('forgot')}>Forgot password?</button>
            <button onClick={() => setMode('otp')}>OTP UI</button>
          </div>
        </div>
      </section>
    </>
  );
}

function Input({ placeholder, type = 'text' }) {
  return <input type={type} placeholder={placeholder} className="rounded-2xl border border-[#D4A373]/20 bg-white/80 px-4 py-3 outline-none dark:bg-white/10" />;
}
