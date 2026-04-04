import { useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputSize = 'sm' | 'default';

const sizeClasses: Record<InputSize, string> = {
  sm: 'px-3 py-2.5 text-sm',
  default: 'px-4 py-3 text-base',
};

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
  inputSize?: InputSize;
}

export function TextInput({
  id,
  label,
  error,
  containerClassName,
  inputSize = 'sm',
  className,
  type,
  ...inputProps
}: TextInputProps) {
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const baseClasses = `w-full ${sizeClasses[inputSize]} rounded-xl text-gray-900 focus:outline-none transition placeholder-gray-400 border`;

  const borderClasses = error
    ? 'border-error focus:border-error'
    : 'border-gray-300 focus:border-primary';

  const mergedClassName = [baseClasses, borderClasses, isPassword && 'pr-10', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <label
        htmlFor={id}
        className="ml-1.5 block text-sm font-medium text-gray-700 mb-1.5"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && showPassword ? 'text' : type}
          className={mergedClassName}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {error && (
        <p className="ml-1.5 mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

