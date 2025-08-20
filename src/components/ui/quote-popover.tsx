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

  const handleClick = () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
    setOpen(true);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <span 
          className="cursor-pointer text-blue-600 hover:text-blue-800 underline"
          onClick={handleClick}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-medium leading-none">
            {type === 'happy' ? '😊 Happy Quote' : '😢 Sad Quote'}
          </h4>
          <p className="text-sm text-muted-foreground">
            {currentQuote}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}