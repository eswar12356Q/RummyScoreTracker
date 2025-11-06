import React from 'react';
import { InputProps } from '../../types';
import { clsx } from 'clsx';

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  error,
  label,
  className = '',
  min,
  max,
  required = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (type === 'number') {
      // Allow empty input or valid numbers within range
      if (newValue === '' || (!isNaN(Number(newValue)) &&
          (min === undefined || Number(newValue) >= min) &&
          (max === undefined || Number(newValue) <= max))) {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  const inputClasses = clsx(
    'flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
      'border-danger-500 focus-visible:ring-danger-500': error,
    },
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        min={min}
        max={max}
        required={required}
      />
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
};

export default Input;