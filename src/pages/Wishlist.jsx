import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import Seo from '../components/Seo.jsx';
import Section from '../components/Section.jsx';
import { addToCart } from '../redux/slices/cartSlice.js';
import { removeWishlist } from '../redux/slices/wishlistSlice.js';

export default function Wishlist() {
  const items = useSelector((state) => state.wishlist.items);
  const dispatch = useDispatch();
  return (
    <>
      <Seo title="Wishlist" description="Saved jewellery favourites at Velvet Spice." />
      <Section eyebrow="Your saved sparkle" title="Wishlist">
        {items.length === 0 ? (
          <div className="grid min-h-96 place-items-center rounded-3xl bg-white/55 text-center shadow-xl dark:bg-white/5"><div><Heart className="mx-auto text-[#D4A373]" size={52} /><p className="mt-4 font-display text-4xl">No favourites yet</p><Link to="/shop" className="mt-5 inline-block rounded-full rose-gradient px-6 py-3 font-bold text-[#1A1A1A]">Browse jewellery</Link></div></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((product) => <div key={product.id}><ProductCard product={product} /><div className="mt-2 flex gap-2"><button onClick={() => dispatch(addToCart(product))} className="flex-1 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-bold text-white">Move to cart</button><button onClick={() => dispatch(removeWishlist(product.id))} className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold dark:bg-white/10">Remove</button></div></div>)}
          </div>
        )}
      </Section>
    </>
  );
}
