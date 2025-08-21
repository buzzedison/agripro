import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  className = '',
  type = 'text',
  ...props
}) => {
  const baseStyles = 'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50';
  
  const classes = `${baseStyles} ${className}`;
  
  return (
    <input type={type} className={classes} {...props} />
  );
};

export default Input;
