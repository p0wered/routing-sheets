import type { InputHTMLAttributes } from 'react';

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
  ...inputProps
}: TextInputProps) {
  const baseClasses = `w-full ${sizeClasses[inputSize]} rounded-xl text-gray-900 focus:outline-none transition placeholder-gray-400 border`;

  const borderClasses = error
    ? 'border-error focus:border-error'
    : 'border-gray-300 focus:border-primary';

  const mergedClassName = [baseClasses, borderClasses, className]
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
      <input id={id} className={mergedClassName} {...inputProps} />
      {error && (
        <p className="ml-1.5 mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

