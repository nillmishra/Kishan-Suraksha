import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import featureImg from '../assets/features.png';

export default function Features() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { replace: true, state: { from: '/upload' } });
    } else {
      navigate('/upload');
    }
  };

  return (
    <section className="relative py-12 md:py-16" id="about">
      <h2 className="text-4xl font-extrabold text-center">Features</h2>
      <div className="h-1 w-20 bg-green-600 rounded mx-auto mt-3" />

      {/* Card container */}
      <div className="max-w-6xl w-full mx-auto mt-10 bg-white p-6 md:p-10 rounded-2xl shadow">
        {/* 40/60 layout on md+ screens */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
          {/* Left: 40% image */}
          <div className="md:col-span-2">
            <div className="w-full rounded-xl bg-gray-50 border p-3 flex items-center justify-center">
              <img
                src={featureImg}
                alt="CropGuard AI feature preview"
                className="w-full h-auto max-h-80 md:max-h-[420px] object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right: 60% text */}
          <div className="md:col-span-3">
            <h3 className="text-2xl md:text-3xl font-semibold">
              CropGuard AI — Plant Leaf Disease Detection
            </h3>
            <p className="text-gray-600 mt-4">
              CropGuard AI brings intelligent plant leaf disease detection to modern agriculture. With the growing
              pressure of pests and pathogens across diverse crops, it’s vital to identify issues early and manage
              them effectively. Our system uses advanced computer vision and machine learning to analyze leaf images
              and flag likely diseases and stress symptoms.
            </p>
            <p className="text-gray-600 mt-4">
              By using this tool, growers can safeguard crop health, optimize yield, and take timely, data‑driven
              actions to limit damage. CropGuard AI helps maintain quality while supporting efficient, sustainable
              farming practices—whether you grow fruits, vegetables, or grains.
            </p>
            <p className="text-gray-600 mt-4">
              Explore our features to see how CropGuard AI streamlines scouting, reduces guesswork, and protects
              your fields throughout the season—improving productivity and peace of mind.
            </p>
            <Button onClick={handleGetStarted} className="mt-6">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}