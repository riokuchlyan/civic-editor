'use client';

import React from 'react';
import { QuotePopover } from '../ui/quote-popover';
import { happyQuotes } from '../../lib/quotes';

export interface HappyElementProps {
  children: React.ReactNode;
  attributes?: Record<string, unknown>;
  element?: Record<string, unknown>;
}

export function HappyElement({ children, attributes }: HappyElementProps) {
  const { key, ...safeAttributes } = attributes || {};
  void key;
  
  return (
    <QuotePopover quotes={happyQuotes} type="happy">
      <span {...safeAttributes} className="happy-text">
        {children}
      </span>
    </QuotePopover>
  );
}
