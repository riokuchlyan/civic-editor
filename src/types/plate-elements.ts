import { PlatePluginComponent } from '@udecode/plate-core';

export interface HappyElement {
  type: 'happy-text';
  children: any[];
}

export interface SadElement {
  type: 'sad-text';
  children: any[];
}

export type CustomElement = HappyElement | SadElement;

export interface PlatePluginOptions {
  component?: PlatePluginComponent;
}