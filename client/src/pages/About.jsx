import { FaLeaf, FaMobileAlt, FaComments, FaCloud } from 'react-icons/fa';
import StarRating from '../components/StarRating';
import Button from '../components/ui/Button';

function Feature({ icon, title, text }) {
  return (
    <div className="flex flex-col items-center text-center card p-6 hover:shadow-md transition">
      <div className="w-14 h-14 rounded-xl bg-green-50 text-green-700 border border-green-200 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  );
}

function Testimonial({ text, author, rating }) {
  return (
    <div className="card p-6 text-left">
      <div className="text-5xl leading-none text-green-200">“</div>
      <p className="text-gray-700 -mt-2">{text}</p>
      <div className="mt-4 flex items-center justify-between">
        <h4 className="text-base font-semibold text-green-700">{author}</h4>
        <StarRating rating={rating} className="mt-0 gap-1" />
      </div>
    </div>
  );
}

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section id="about" className="bg-gradient-to-b from-green-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="text-center">
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
              About
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-3">KisanSuraksha</h1>
            <p className="text-gray-700 mt-3 max-w-2xl mx-auto">
              Empowering farmers with AI to protect crops, boost yield, and farm sustainably.
            </p>
          </div>

          {/* Intro card */}
          <div className="max-w-6xl mx-auto mt-10 card p-6 md:p-10">
            <h2 className="text-2xl md:text-3xl font-extrabold">Who we are</h2>
            <p className="mt-4 text-gray-700">
              KisanSuraksha is dedicated to helping farmers protect their crops through cutting-edge technology.
              We offer an AI-powered leaf disease detection system that identifies crop issues quickly and helps
              you take timely action. With a focus on sustainability and innovation, KisanSuraksha is transforming
              modern agriculture.
            </p>

            {/* Mission + Why (2 columns) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-muted p-6">
                <h3 className="text-xl font-semibold text-green-700">Our Mission</h3>
                <p className="mt-3 text-gray-700">
                  Empower growers with practical, AI-driven tools and insights. By combining computer vision and
                  agronomy best practices, we help you protect crop health, improve yield quality, and reduce losses
                  — sustainably.
                </p>
              </div>
              <div className="card-muted p-6">
                <h3 className="text-xl font-semibold text-green-700">Why Choose Us?</h3>
                <ul className="mt-3 list-disc list-inside text-gray-700 space-y-2">
                  <li>Advanced, image-based disease detection</li>
                  <li>Simple, mobile-friendly experience</li>
                  <li>Comprehensive, actionable guidance</li>
                  <li>Built with sustainability in mind</li>
                </ul>
              </div>
            </div>

            {/* Quick stats */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="card p-4">
                <div className="text-2xl font-extrabold text-green-700">10K+</div>
                <div className="text-sm text-gray-600">Scans analyzed</div>
              </div>
              <div className="card p-4">
                <div className="text-2xl font-extrabold text-green-700">95%</div>
                <div className="text-sm text-gray-600">Users satisfied</div>
              </div>
              <div className="card p-4">
                <div className="text-2xl font-extrabold text-green-700">30+</div>
                <div className="text-sm text-gray-600">Crops supported</div>
              </div>
              <div className="card p-4">
                <div className="text-2xl font-extrabold text-green-700">24/7</div>
                <div className="text-sm text-gray-600">Access anywhere</div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/upload">Try CropGuard AI</Button>
              <Button to="/products" variant="outline">Browse Products</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-14 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold">Our Features</h2>
          <div className="h-1 w-20 bg-green-600 rounded mx-auto mt-3" />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature
              icon={<FaLeaf className="text-2xl" />}
              title="AI-Based Detection"
              text="Advanced computer vision analyzes leaf images for fast, accurate detection."
            />
            <Feature
              icon={<FaMobileAlt className="text-2xl" />}
              title="Mobile-Friendly"
              text="Scan and review results on any device—anytime, anywhere."
            />
            <Feature
              icon={<FaComments className="text-2xl" />}
              title="Expert Support"
              text="Get practical advice and guidance for confident decisions."
            />
            <Feature
              icon={<FaCloud className="text-2xl" />}
              title="Cloud Storage"
              text="Securely store scans and track your crop health history."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-to-b from-white to-green-50 py-14 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold">What Our Farmers Say</h2>
          <div className="h-1 w-20 bg-green-600 rounded mx-auto mt-3" />
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Testimonial
              text="KisanSuraksha has changed the way I manage crops. Detection is quick and accurate, so I can act immediately."
              author="– Rajesh Kumar, Farmer"
              rating={4.5}
            />
            <Testimonial
              text="Saved my field from a major outbreak. The recommendations were spot on and easy to follow."
              author="– Anjali Devi, Rice Farmer"
              rating={5}
            />
            <Testimonial
              text="The AI scan is fast and reliable. It helped me catch issues before they spread."
              author="– Ravi Patel, Farmer"
              rating={5}
            />
            <Testimonial
              text="Simple to use, even for non-tech users. I got results and treatment tips within minutes."
              author="– Ananya Sharma, Agronomist"
              rating={5}
            />
          </div>

          {/* Bottom CTA */}
          <div className="mt-10">
            <Button to="/upload">Start a Free Scan</Button>
          </div>
        </div>
      </section>
    </div>
  );
}