'use client';

import { rewriteText } from '../../lib/ai';

export const createAISlashCommandPlugin = () => {
  return {

    handlers: {
      onKeyDown: (editor: any, event: KeyboardEvent) => {
        if (event.key === 'Enter' && event.ctrlKey) {
          event.preventDefault();
          
          const { selection } = editor;
          if (!selection) return;

          const [node] = editor.node(selection.anchor.path);
          if (node && typeof node.text === 'string') {
            const text = node.text;
            
            if (text.includes('/rewrite')) {
              const textToRewrite = text.replace('/rewrite', '').trim();
              
              if (textToRewrite) {
                const isHappyPage = window.location.pathname === '/happy';
                const mood = isHappyPage ? 'happy' : 'sad';
                
                rewriteText(textToRewrite, mood).then((rewrittenText) => {
                  try {
                    editor.insertText(rewrittenText);
                    const range = editor.selection;
                    if (range) {
                      editor.select(range);
                      editor.deleteBackward('character', { count: text.length });
                      editor.insertText(rewrittenText);
                    }
                  } catch (error) {
                    editor.insertText(' → ' + rewrittenText);
                  }
                }).catch((error) => {
                });
              }
            }
          }
        }
      },
    },
  };
};
