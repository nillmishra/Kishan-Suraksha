import { useLocation, Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import logo from '../assets/newlogo.png';
import appImg from '../assets/app.jpg';
import playImg from '../assets/play.jpg';
import payImg from '../assets/pay.png';

export default function Footer() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/admin') || pathname === '/login' || pathname === '/signup') return null;

  return (
    <footer id="contact" className="bg-gray-100 shadow-inner mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <img src={logo} alt="Kishan Suraksha" className="w-40 -ml-2" />
          <h4 className="mt-4 text-sm font-semibold">Contact</h4>
          <p className="text-sm mt-2"><strong>Address:</strong> H-893 Sutta Bajar, Asansol, WB, India</p>
          <p className="text-sm"><strong>Phone:</strong> +91 468 2893 529 / +91 709 1555 708</p>
          <p className="text-sm"><strong>Hours:</strong> 10:00 - 19:00, Mon - Sat</p>

          <div className="mt-5">
            <h4 className="text-sm font-semibold">Follow Us</h4>
            <div className="flex items-center gap-3 mt-2 text-gray-600">
              <a href="#" className="hover:text-green-700" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" className="hover:text-green-700" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" className="hover:text-green-700" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" className="hover:text-green-700" aria-label="Pinterest"><FaPinterestP /></a>
              <a href="#" className="hover:text-green-700" aria-label="YouTube"><FaYoutube /></a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">About</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/about" className="text-sm text-gray-800 hover:text-green-700">About Us</Link></li>
            <li><a href="/orders" className="text-sm text-gray-800 hover:text-green-700">Delivery Information</a></li>
            <li><a href="#" className="text-sm text-gray-800 hover:text-green-700">Privacy Policy</a></li>
            <li><a href="#" className="text-sm text-gray-800 hover:text-green-700">Terms & Conditions</a></li>
            <li><Link to="/contact" className="text-sm text-gray-800 hover:text-green-700">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">My Account</h4>
          <ul className="mt-3 space-y-2">
            <li><Link to="/login" className="text-sm text-gray-800 hover:text-green-700">Sign In</Link></li>
            <li><Link to="/cart" className="text-sm text-gray-800 hover:text-green-700">View Cart</Link></li>
            <li><a href="#" className="text-sm text-gray-800 hover:text-green-700">My Wishlist</a></li>
            <li>
              <Link to="/my-orders" className="text-sm text-gray-800 hover:text-green-700">Orders</Link>
            </li>
            <li>
              <Link to="/orders" className="text-sm text-gray-800 hover:text-green-700">Track My Order</Link>
            </li>
            <li><a href="/contact" className="text-sm text-gray-800 hover:text-green-700">Help</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Install App</h4>
          <p className="text-sm mt-2">From App Store or Google Play</p>
          <div className="flex items-center gap-3 mt-3">
            <img src={appImg} alt="App Store" className="w-32 border border-teal-600 rounded" />
            <img src={playImg} alt="Google Play" className="w-32 border border-teal-600 rounded" />
          </div>
          <p className="text-sm mt-4">Secured Payment Gateways</p>
          <img src={payImg} alt="Payments" className="mt-2 w-60 max-w-full" />
        </div>
      </div>

      <div className="border-t border-gray-200">
        <p className="text-center py-4 text-sm text-gray-700">© Copyright 2024 - Nill Mishra</p>
      </div>
    </footer>
  );
}