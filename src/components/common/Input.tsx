import { ReactNode } from 'react';

interface InputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  name: string;
  disabled?: boolean;
}

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  icon, 
  rightIcon,
  name,
  disabled = false
}: InputProps) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        {icon && (
          <div className="absolute left-3 top-2.5 text-gray-400">
            {icon}
          </div>
        )}
        {rightIcon && (
          <div className="absolute right-3 top-2.5 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
