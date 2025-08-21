import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources - AgriPro Knowledge Hub',
  description: 'Practical tools and calculators for agricultural business decision-making',
};

export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
