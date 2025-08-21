import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Hub - AgriPro",
  description: "Explore our comprehensive knowledge hub for agribusiness insights, best practices, and expert advice.",
};

export default function KnowledgeHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}