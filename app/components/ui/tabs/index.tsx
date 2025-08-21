import React from 'react';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className = '', 
  ...props 
}) => {
  const [selectedTab, setSelectedTab] = React.useState(value || defaultValue);
  
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);
  
  const handleTabChange = (newValue: string) => {
    setSelectedTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };
  
  // Pass the selected tab value to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        selectedTab: selectedTab,
        onSelect: handleTabChange
      } as React.ComponentProps<typeof TabsList> | React.ComponentProps<typeof TabsContent>);
    }
    return child;
  });
  
  return (
    <div 
      className={`${className}`} 
      {...props} 
      data-tabs-root 
      data-orientation="horizontal"
    >
      {childrenWithProps}
    </div>
  );
};

interface TabsListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  children: React.ReactNode;
  selectedTab?: string;
  onSelect?: (value: string) => void;
}

export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  selectedTab, 
  onSelect, 
  className = '', 
  ...props 
}) => {
  // Pass the selected tab value to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        selectedTab: selectedTab,
        onSelect: onSelect
      } as React.ComponentProps<typeof TabsTrigger>);
    }
    return child;
  });
  
  // Ensure we have at least one tab
  const hasTabChild = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && 
    // Check if it's a TabsTrigger by checking for role="tab" prop
    (child.props.role === 'tab' || (child.type as any)?.displayName === 'TabsTrigger')
  );

  return (
    <div 
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`} 
      role="tablist"
      aria-orientation="horizontal"
      {...props}
    >
      {childrenWithProps}
      {/* This hidden element ensures there's always a tab role for the tablist */}
      {!hasTabChild && (
        <button 
          className="sr-only" 
          role="tab" 
          aria-selected="false"
          tabIndex={-1}
        >
          Hidden tab
        </button>
      )}
    </div>
  );
};

interface TabsTriggerProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onSelect'> {
  value: string;
  children: React.ReactNode;
  selectedTab?: string;
  onSelect?: (value: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
  value, 
  children, 
  selectedTab, 
  onSelect, 
  className = '', 
  ...props 
}) => {
  const isSelected = selectedTab === value;
  
  const handleClick = () => {
    if (onSelect) {
      onSelect(value);
    }
  };
  
  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isSelected ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'} ${className}`}
      role="tab"
      aria-selected={isSelected ? "true" : "false"}
      tabIndex={isSelected ? 0 : -1}
      aria-controls={`panel-${value}`}
      id={`tab-${value}`}
      onClick={handleClick}
      data-state={isSelected ? "active" : "inactive"}
      {...props}
    >
      {children}
    </button>
  );
};

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  selectedTab?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ 
  value, 
  children, 
  selectedTab, 
  className = '', 
  ...props 
}) => {
  const isSelected = selectedTab === value;
  
  if (!isSelected) {
    return null;
  }
  
  return (
    <div
      className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 ${className}`}
      role="tabpanel"
      aria-labelledby={`tab-${value}`}
      id={`panel-${value}`}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
};

export default {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
};
