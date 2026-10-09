import { motion } from 'framer-motion';

export default function Section({ eyebrow, title, children, className = '' }) {
  return (
    <motion.section
      className={`mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 ${className}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      {(eyebrow || title) && (
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#D4A373]">{eyebrow}</p>}
            {title && <h2 className="font-display text-4xl text-[#1A1A1A] dark:text-[#FFF8F5] sm:text-5xl">{title}</h2>}
          </div>
        </div>
      )}
      {children}
    </motion.section>
  );
}
