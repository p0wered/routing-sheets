import type { ButtonHTMLAttributes, PropsWithChildren, ReactNode } from 'react';

type ButtonSize = 'small' | 'default';
type ButtonColor = 'primary' | 'secondary' | 'error';

interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    PropsWithChildren {
  size?: ButtonSize;
  color?: ButtonColor;
  /** Иконка из lucide-react, например <Save className="w-4 h-4" /> */
  icon?: ReactNode;
  /** Позиция иконки относительно текста */
  iconPosition?: 'left' | 'right';
}

export function Button({
  size = 'default',
  color = 'primary',
  className = '',
  children,
  disabled,
  icon,
  iconPosition = 'left',
  ...rest
}: ButtonProps) {
  const sizeClasses =
    size === 'small' ? 'py-3 px-6 text-sm' : 'py-3 px-8 text-lg';

  const colorBaseClasses =
    color === 'error'
      ? 'bg-error text-white'
      : color === 'secondary'
        ? 'bg-gray-200 text-gray-600'
        : 'bg-primary text-white';

  const colorHoverClasses = disabled
    ? ''
    : color === 'error'
      ? ' hover:bg-red-600'
      : color === 'secondary'
        ? ' hover:bg-gray-300'
        : ' hover:bg-primary-light';

  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition';

  const interactionClasses = disabled ? '' : ' cursor-pointer active:scale-98';

  const combinedClasses = `${baseClasses}${interactionClasses} ${sizeClasses} ${colorBaseClasses}${colorHoverClasses}${
    className ? ` ${className}` : ''
  }`;

  const iconWrapperClass =
    size === 'small' ? 'shrink-0 [&>svg]:size-4' : 'shrink-0 [&>svg]:size-5';
  const iconEl = icon ? (
    <span className={iconWrapperClass} aria-hidden>
      {icon}
    </span>
  ) : null;

  return (
    <button className={combinedClasses} disabled={disabled} {...rest}>
      {iconPosition === 'left' && iconEl}
      {children}
      {iconPosition === 'right' && iconEl}
    </button>
  );
}

