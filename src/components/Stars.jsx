import { Star } from 'lucide-react';

export default function Stars({ rating = 5 }) {
  return (
    <div className="flex items-center gap-0.5 text-[#D4A373]" aria-label={`${rating} star rating`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={14} fill={index < Math.round(rating) ? 'currentColor' : 'none'} />
      ))}
    </div>
  );
}
