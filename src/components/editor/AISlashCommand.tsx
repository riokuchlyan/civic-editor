'use client';

import { rewriteText } from '../../lib/ai';

export const createAISlashCommandPlugin = () => {
  return {
    // Plugin configuration without using 'key' prop for JSX
    handlers: {
      onKeyDown: (editor: any, event: KeyboardEvent) => {
        if (event.key === 'Enter' && event.ctrlKey) {
          event.preventDefault();
          
          // Get current text from editor
          const { selection } = editor;
          if (!selection) return;

          // Get text content from current node
          const [node] = editor.node(selection.anchor.path);
          if (node && typeof node.text === 'string') {
            const text = node.text;
            
            if (text.includes('/rewrite')) {
              // Get the text before /rewrite
              const textToRewrite = text.replace('/rewrite', '').trim();
              
              if (textToRewrite) {
                // Determine mood from current page
                const isHappyPage = window.location.pathname === '/happy';
                const mood = isHappyPage ? 'happy' : 'sad';
                
                rewriteText(textToRewrite, mood).then((rewrittenText) => {
                  // Replace the current text with rewritten version
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
                  // Handle rewrite error silently
                });
              }
            }
          }
        }
      },
    },
  };
};
