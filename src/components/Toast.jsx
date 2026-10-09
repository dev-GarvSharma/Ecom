import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../redux/slices/uiSlice.js';

export default function Toast() {
  const toast = useSelector((state) => state.ui.toast);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => dispatch(hideToast()), 2200);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  return (
    <AnimatePresence>
      {toast && <motion.div className="fixed left-1/2 top-28 z-[100] -translate-x-1/2 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm font-semibold text-white shadow-2xl" initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>{toast}</motion.div>}
    </AnimatePresence>
  );
}
