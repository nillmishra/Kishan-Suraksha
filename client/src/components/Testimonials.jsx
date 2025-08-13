import StarRating from './StarRating';

const testimonials = [
  {
    text: `KisanSuraksha has revolutionized the way I manage my crops. With quick and accurate disease detection, I'm able to take immediate action and protect my yield.`,
    author: '– Rajesh Kumar, Farmer',
    rating: 4.5,
  },
  {
    text: `Thanks to KisanSuraksha, I saved my crops from a major disease outbreak. The detection was fast and the solutions provided were effective.`,
    author: '– Anjali Devi, Rice Farmer',
    rating: 5,
  },
  {
    text: `KisanSuraksha saved my crops from a potential disaster. The AI detection was fast and accurate.`,
    author: '– Ravi Patel, Farmer',
    rating: 5,
  },
  {
    text: `The platform is incredibly easy to use. I identified the disease and got recommendations within minutes.`,
    author: '– Ananya Sharma, Agronomist',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gradient-to-b from-white to-green-50 py-12 md:py-16 relative text-center">
      <h2 className="text-3xl font-extrabold">Testimonials</h2>
      <div className="h-1 w-20 bg-green-600 rounded mx-auto mt-3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
        {testimonials.map((t, idx) => (
          <div key={idx} className="card p-6 text-left">
            <div aria-hidden="true" className="text-5xl leading-none text-green-200">“</div>
            <p className="text-gray-700 -mt-2">"{t.text}"</p>
            <div className="mt-4 flex items-center justify-between">
              <h4 className="text-base font-semibold text-green-700">{t.author}</h4>
              <StarRating rating={Number(t.rating)} className="mt-0 gap-1" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}