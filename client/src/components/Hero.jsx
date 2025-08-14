import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import heroImg from '../assets/6615457-removebg.png';

export default function Hero() {
  const navigate = useNavigate();

  const handleExplore = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true, state: { from: '/upload' } });
    } else {
      navigate('/upload');
    }
  };

  return (
    <header className="bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col-reverse md:flex-row items-center justify-between gap-10">
          <div className="md:min-w-[300px]">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              New • AI-powered
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mt-4">
              Protect Your Plants,<br /> Naturally!
            </h1>
            <p className="text-gray-600 mt-4 text-lg">
              KisanSuraksha identifies plant diseases through leaf images and points you to the right
              actions and products — for healthier crops, faster.
            </p>
            <div className="mt-6 flex gap-3">
              <Button onClick={handleExplore}>Try CropGuard AI</Button>
              <Button to="/products" variant="outline">Browse Products</Button>
            </div>

            <ul className="mt-6 text-sm text-gray-600 grid grid-cols-2 gap-2 max-w-sm">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                AI-based detection
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Multi-crop support
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Free to try
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Works on mobile
              </li>
            </ul>
          </div>

    
          <div className="relative w-full md:w-auto">
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-green-200/40 rounded-full blur-3xl" />
            <div className="w-full rounded-2xl p-4 flex items-center justify-center">
              <img
                src={heroImg}
                alt="Healthy plant illustration"
                className="w-[500px] max-w-full object-contain"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}