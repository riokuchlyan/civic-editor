'use client';

import React from 'react';
import { QuotePopover } from '../ui/quote-popover';
import { sadQuotes } from '../../lib/quotes';

export interface SadElementProps {
  children: React.ReactNode;
  attributes?: Record<string, unknown>;
  element?: Record<string, unknown>;
}

export function SadElement({ children, attributes }: SadElementProps) {
  // Extract key from attributes to avoid React key prop spreading issue
  const { key, ...safeAttributes } = attributes || {};
  // Suppress unused variable warning by referencing it
  void key;
  
  return (
    <QuotePopover quotes={sadQuotes} type="sad">
      <span {...safeAttributes} className="sad-text">
        {children}
      </span>
    </QuotePopover>
  );
}
