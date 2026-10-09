import { useEffect } from 'react';

export default function Seo({ title, description }) {
  useEffect(() => {
    document.title = title ? `${title} | Velvet Spice` : 'Velvet Spice | Luxury Artificial Jewellery Boutique';
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);

  return null;
}
