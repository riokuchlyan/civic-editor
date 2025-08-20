'use client';

import React from 'react';
import { QuotePopover } from '../ui/quote-popover';
import { happyQuotes } from '../../lib/quotes';

export interface HappyElementProps {
  children: React.ReactNode;
  attributes: any;
}

export function HappyElement({ children, attributes }: HappyElementProps) {
  // Extract key from attributes to avoid React key prop spreading issue
  const { key, ...safeAttributes } = attributes || {};
  
  return (
    <QuotePopover quotes={happyQuotes} type="happy">
      <span {...safeAttributes} className="happy-text">
        {children}
      </span>
    </QuotePopover>
  );
}
