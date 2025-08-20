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

export const createWordDetectionPlugin = () => {
  return {
    handlers: {
      onKeyDown: (editor: any, event: KeyboardEvent) => {
        return false;
      },
    },
    withTransforms: (editor: any) => {
      const { insertText } = editor;

      editor.insertText = (text: string) => {
        insertText(text);
      };

      return editor;
    },
  };
};
