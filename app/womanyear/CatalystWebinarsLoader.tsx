'use client';

import { useEffect, useState } from 'react';
import CatalystWebinarsSection from './CatalystWebinarsSection';
import type { CatalystWebinar } from '@/lib/catalyst-w/webinars';

export default function CatalystWebinarsLoader() {
    const [webinars, setWebinars] = useState<CatalystWebinar[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        fetch('/api/catalyst-w/webinars')
            .then(r => r.ok ? r.json() : [])
            .then(data => setWebinars(data))
            .catch(() => setWebinars([]))
            .finally(() => setLoaded(true));
    }, []);

    if (!loaded || webinars.length === 0) return null;
    return <CatalystWebinarsSection webinars={webinars} />;
}
