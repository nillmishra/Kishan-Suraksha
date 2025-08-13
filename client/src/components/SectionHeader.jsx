export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center animate-fadeInUp">
      <h2 className="text-3xl md:text-4xl font-extrabold gradient-text">{title}</h2>
      {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      <div className="h-1 w-24 bg-gradient-to-r from-brand-400 to-teal-400 rounded mx-auto mt-4" />
    </div>
  );
}