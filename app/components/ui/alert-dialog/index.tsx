import React, { useState, useEffect, useRef } from 'react';

interface AlertDialogProps {
  children: React.ReactNode;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ children }) => {
  return <div>{children}</div>;
};

interface AlertDialogTriggerProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({ 
  children, 
  onClick 
}) => {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  );
};

interface AlertDialogContentProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ 
  children, 
  isOpen = false, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const backdropRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setIsVisible(isOpen);
    
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isVisible) {
    return null;
  }
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current && onClose) {
      onClose();
    }
  };
  
  return (
    <div 
      ref={backdropRef}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

export const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ children }) => {
  return <div className="p-6 pb-0">{children}</div>;
};

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

export const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

export const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ children }) => {
  return <p className="mt-2 text-sm text-gray-500">{children}</p>;
};

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

export const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ children }) => {
  return (
    <div className="flex justify-end gap-2 p-6 pt-0 mt-6">
      {children}
    </div>
  );
};

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ 
  children,
  className = '',
  ...props
}) => {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ 
  children,
  className = '',
  ...props
}) => {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
};
