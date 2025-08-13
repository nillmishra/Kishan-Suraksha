import { Link, useLocation, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function ErrorPage() {
  const location = useLocation();
  const [search] = useSearchParams();
  const message = location.state?.message || search.get('msg') || search.get('error') || 'An unexpected error occurred. Please try again.';

  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="min-h-[60vh] bg-gradient-to-br from-cyan-100 to-cyan-300 rounded-2xl shadow flex flex-col items-center justify-center text-center px-8 py-16">
          <h1 className="text-4xl font-extrabold text-red-600">Error Occurred</h1>
          <p className="mt-4 text-lg text-gray-700">{message}</p>

          <div className="mt-8 flex items-center gap-3">
            <Button to="/upload">Go Back</Button>
            <Link to="/" className="inline-flex items-center justify-center rounded-full px-6 py-2.5 font-medium text-green-700 hover:bg-green-50 transition">
              Home
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          © 2024 Rice Leaf Disease Detection
        </div>
      </div>
    </section>
  );
}