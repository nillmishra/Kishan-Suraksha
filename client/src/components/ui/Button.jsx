import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-2.5',
  lg: 'px-8 py-3 text-base',
};

const variants = {
  primary: 'bg-green-600 text-white hover:bg-green-700',
  outline: 'border border-green-600 text-green-700 hover:bg-green-50',
  ghost: 'text-green-700 hover:bg-green-50',
};

function clsx(...c) {
  return c.filter(Boolean).join(' ');
}

const Button = forwardRef(
  (
    {
      to,
      href,
      type = 'button',
      children,
      className = '',
      size = 'md',
      variant = 'primary',
      disabled = false,
      loading = false,
      ...props
    },
    ref
  ) => {
   const base =
  'inline-flex items-center justify-center rounded-full font-medium transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-600 disabled:opacity-60 disabled:cursor-not-allowed';
    const classes = clsx(base, sizes[size], variants[variant], className);

    if (to) {
      return (
        <Link ref={ref} to={to} className={classes} aria-disabled={disabled || loading} {...props}>
          {loading && <Spinner />}
          {children}
        </Link>
      );
    }

    if (href) {
      return (
        <a ref={ref} href={href} className={classes} aria-disabled={disabled || loading} {...props}>
          {loading && <Spinner />}
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...props}>
        {loading && <Spinner />}
        {children}
      </button>
    );
  }
);

function Spinner() {
  return (
    <svg className="mr-2 h-4 w-4 animate-spin text-current" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default Button;