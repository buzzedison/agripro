import React, { useRef, useEffect } from 'react';

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxHeight?: string | number;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  maxHeight = '400px',
  className = '',
  ...props
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Convert maxHeight to a CSS class name
  const getMaxHeightClass = () => {
    if (typeof maxHeight === 'number') {
      return `max-h-[${maxHeight}px]`;
    }
    return `max-h-[${maxHeight}]`;
  };

  return (
    <div
      ref={scrollAreaRef}
      className={`relative overflow-auto ${getMaxHeightClass()} ${className}`}
      {...props}
    >
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  );
};

export default ScrollArea;
