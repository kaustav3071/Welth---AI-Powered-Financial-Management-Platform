"use client";

import { UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export default function UserButtonWrapper() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse" />
        );
    }

    return (
        <UserButton 
            appearance={{
                elements: {
                    avatarBox: 'h-10 w-10 rounded-xl shadow-lg hover:shadow-hover transition-all duration-300',
                }
            }} 
        />
    );
}
