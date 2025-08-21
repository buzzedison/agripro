import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ROI Calculator - AgriPro Knowledge Hub',
  description: 'Calculate and compare return on investment for crops and livestock farming',
};

export default function ROICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
