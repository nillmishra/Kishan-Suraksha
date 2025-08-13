import Hero from '../components/Hero';
import Features from '../components/Features';
import ProductsSection from '../components/Products';
import Testimonials from '../components/Testimonials';

export default function Home() {
  return (
    <div id="home" className="bg-gradient-to-b from-green-50 via-white to-white">
      <Hero />
      <Features />
      <ProductsSection gateAdd /> {/* Gate add-to-cart on Home only */}
      <Testimonials />
    </div>
  );
}