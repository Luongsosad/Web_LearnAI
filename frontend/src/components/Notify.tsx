import React, { useEffect, useState } from 'react';

interface NotifyProps {
    message: string | null;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export default function Notify({ message, type = 'info', duration = 2000, onClose }: NotifyProps) {
    const [show, setShow] = useState<string | null>(message);

    useEffect(() => {
        if (message) {
            setShow(message);
            const timer = setTimeout(() => {
                setShow(null);
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        } else {
            setShow(null);
        }
    }, [message, duration]);

    if (!show) return null;

    const getColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
            case 'info':
            default:
                return 'bg-blue-500';
        }
    };

    return (
        <div className={`fixed text-sm w-[240px] text-center top-12 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2 text-white rounded-lg shadow-lg ${getColor()} animate-fade-in`}>
            {message}
        </div>
    );
}