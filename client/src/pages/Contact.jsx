import { useEffect, useState } from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube } from 'react-icons/fa';
import Button from '../components/ui/Button';

export default function Contact() {
  const [values, setValues] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    const prev = document.title;
    document.title = 'Contact | KisanSuraksha';
    return () => { document.title = prev; };
  }, []);

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((err) => ({ ...err, [e.target.name]: '' }));
    setStatus('');
  };

  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Enter a valid email.';
    if (!values.message.trim() || values.message.length < 10) e.message = 'At least 10 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          message: values.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to send message');

      setValues({ name: '', email: '', message: '' });
      setStatus('Thanks! We received your message and will get back to you shortly.');
    } catch (err) {
      setStatus(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusClass = status.startsWith('Thanks') ? 'text-green-700' : 'text-red-600';

  return (
    <section className="bg-gradient-to-b from-green-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Header */}
        <div className="text-center">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
            Contact
          </span>
          <h2 className="text-4xl font-extrabold mt-3">Get In Touch</h2>
          <p className="text-gray-700 mt-2">We typically reply within 24 hours.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
          <div className="md:col-span-2 card p-6 md:p-8 h-full flex flex-col">
            <h3 className="text-xl font-semibold">How can we help?</h3>
            <p className="text-gray-700 mt-2">
              Questions about CropGuard AI, products, or orders? Reach out and we’ll be happy to help.
            </p>

            <div className="mt-6 space-y-4 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Address</div>
                  <div>H-893 Sutta Bajar, Asansol, WB, India</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <FaPhoneAlt />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Phone</div>
                  <div>+91 468 2893 529 / +91 709 1555 708</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <FaEnvelope />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Email</div>
                  <div>support@kishansuraksha.local</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
                  <FaClock />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Hours</div>
                  <div>Mon–Sat, 10:00–19:00 IST</div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="text-sm font-semibold">Follow Us</div>
              <div className="mt-2 flex items-center gap-3 text-gray-600">
                <a href="#" className="hover:text-green-700" aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" className="hover:text-green-700" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className="hover:text-green-700" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className="hover:text-green-700" aria-label="Pinterest"><FaPinterestP /></a>
                <a href="#" className="hover:text-green-700" aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>
          </div>


          <div className="md:col-span-3 card p-6 md:p-8 h-full flex flex-col">
            <h3 className="text-xl font-semibold text-center md:text-left">Send us a message</h3>

            <form onSubmit={onSubmit} className="mt-6 flex-1 flex flex-col" noValidate>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                <input
                  id="name" name="name" type="text" value={values.name} onChange={onChange}
                  className={`mt-1 w-full input-outline ${errors.name ? 'border-red-500 focus:ring-red-600' : ''}`}
                  placeholder="e.g., Rohan Singh"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}

                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mt-4">Your Email</label>
                <input
                  id="email" name="email" type="email" value={values.email} onChange={onChange}
                  className={`mt-1 w-full input-outline ${errors.email ? 'border-red-500 focus:ring-red-600' : ''}`}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}

                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mt-4">Your Message</label>
                <textarea
                  id="message" name="message" rows="5" value={values.message} onChange={onChange}
                  className={`mt-1 w-full input-outline resize-y ${errors.message ? 'border-red-500 focus:ring-red-600' : ''}`}
                  placeholder="How can we help you?"
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
              </div>

              {status && <div className={`mt-4 text-sm ${statusClass}`}>{status}</div>}

              <div className="mt-6">
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send Message'}
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center md:text-left">
                  By submitting, you agree to be contacted about your inquiry.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}