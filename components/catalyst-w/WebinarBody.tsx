function flushList(items: string[], key: number) {
    if (items.length === 0) return null;
    return (
        <ul key={`list-${key}`} className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
            {items.map((item, i) => (
                <li key={i}>{item}</li>
            ))}
        </ul>
    );
}

export default function WebinarBody({ content }: { content: string }) {
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listKey = 0;

    const flush = () => {
        const list = flushList(listItems, listKey++);
        if (list) elements.push(list);
        listItems = [];
    };

    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('## ')) {
            flush();
            elements.push(
                <h2 key={elements.length} className="text-2xl font-bold text-[#0B2C24] mb-4 mt-10 first:mt-0">
                    {trimmed.slice(3)}
                </h2>
            );
        } else if (trimmed.startsWith('### ')) {
            flush();
            elements.push(
                <h3 key={elements.length} className="text-lg font-bold text-[#0B2C24] mb-3 mt-6">
                    {trimmed.slice(4)}
                </h3>
            );
        } else if (trimmed.startsWith('- ')) {
            listItems.push(trimmed.slice(2));
        } else {
            flush();
            elements.push(
                <p key={elements.length} className="text-gray-600 leading-relaxed mb-5">
                    {trimmed}
                </p>
            );
        }
    }
    flush();

    return <div className="max-w-none">{elements}</div>;
}
