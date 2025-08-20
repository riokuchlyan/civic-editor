'use client';

import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface QuotePopoverProps {
  children: React.ReactNode;
  quotes: string[];
  type: 'happy' | 'sad';
}

export function QuotePopover({ children, quotes, type }: QuotePopoverProps) {
  const [open, setOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState('');

  const handleMouseEnter = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span 
          className={`cursor-default font-medium underline decoration-2 underline-offset-2 ${
            type === 'happy' 
              ? 'text-green-600 decoration-green-300 hover:text-green-700 hover:decoration-green-400' 
              : 'text-red-600 decoration-red-300 hover:text-red-700 hover:decoration-red-400'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80"
        style={{
          backgroundColor: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          borderRadius: '0.5rem',
        }}
      >
        <div className="space-y-3">
          <h4 
            className="font-medium leading-none"
            style={{ 
              color: type === 'happy' ? '#16a34a' : '#dc2626',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            {type === 'happy' ? '😊 Happy Quote' : '😔 Contemplative Quote'}
          </h4>
          <p 
            style={{
              fontSize: '0.875rem',
              lineHeight: '1.5',
              color: 'hsl(var(--foreground))',
              fontStyle: 'italic',
              backgroundColor: type === 'happy' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: `1px solid ${type === 'happy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              margin: 0
            }}
          >
            {currentQuote}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}