import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createBasicMarkPlugins } from '@udecode/plate-basic-marks';
import { createBasicElementPlugins } from '@udecode/plate-basic-elements';
import { createListPlugin } from '@udecode/plate-list';
import { HappyElement } from '../components/editor/HappyElement';
import { SadElement } from '../components/editor/SadElement';

export const createPlatePlugins = (options: { mood: 'happy' | 'sad'; roomId?: string }) => [
  createParagraphPlugin(),
  createHeadingPlugin(),
  ...createBasicMarkPlugins(),
  ...createBasicElementPlugins(),
  createListPlugin(),
];

export const createPlateComponents = () => ({
  'happy-text': HappyElement,
  'sad-text': SadElement,
});

// Word detection plugin to transform "happy" and "sad" words into custom elements
export const createWordDetectionPlugin = () => {
  return {
    // Plugin configuration without using 'key' prop for JSX
    handlers: {
      onKeyDown: (editor: any, event: KeyboardEvent) => {
        // TODO: Implement word detection logic
        // This would detect when users type "happy" or "sad" and transform them into custom elements
        return false;
      },
    },
    withTransforms: (editor: any) => {
      const { insertText } = editor;

      editor.insertText = (text: string) => {
        // TODO: Implement text transformation logic
        // Detect "happy" and "sad" words and wrap them in custom elements
        insertText(text);
      };

      return editor;
    },
  };
};
