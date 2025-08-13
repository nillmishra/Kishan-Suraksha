export function Input({ label, error, helper, className = '', ...props }) {
  return (
    <div className="animate-fadeInUp">
      {label && <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-600 focus:ring-brand-600 ${error ? 'border-red-500 focus:border-red-600 focus:ring-red-600' : ''} ${className}`}
        {...props}
      />
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : helper ? <p className="mt-1 text-xs text-gray-500">{helper}</p> : null}
    </div>
  );
}