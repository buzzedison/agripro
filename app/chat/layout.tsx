export const metadata = {
    title: 'AgriPro AI',
    description: 'Chat with AgriPro AI about African agriculture, agribusiness, and farming.',
};

// Nested layout — renders without the global navbar or footer
export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
