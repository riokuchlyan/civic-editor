'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plate } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createBoldPlugin, createItalicPlugin, createUnderlinePlugin } from '@udecode/plate-basic-marks';
import { createListPlugin } from '@udecode/plate-list';
// import { createYjsPlugin } from '@udecode/plate-yjs'; // Package doesn't exist in current version
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAI } from '../../hooks/useAI';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

interface PlateEditorProps {
  roomId?: string;
  mood: 'happy' | 'sad';
}

const getStarterText = (mood: 'happy' | 'sad') => {
  if (mood === 'happy') {
    return `<h1>Welcome to the Happy Editor! ✨</h1>
<p>This is your space to write positive, uplifting content. Here are some ideas to get you started:</p>
<ul>
<li><strong>Gratitude journaling</strong> - What are you thankful for today?</li>
<li><strong>Goal setting</strong> - What exciting plans do you have?</li>
<li><strong>Positive reflections</strong> - What made you smile recently?</li>
</ul>
<p>Try typing some text and then use <strong>/rewrite</strong> followed by <strong>Ctrl+Enter</strong> to make it even more positive!</p>
<p>You can also type words like "happy" to create interactive elements. <em>Start writing your happy thoughts below...</em></p>`;
  } else {
    return `<h1>Welcome to the Contemplative Editor 🌙</h1>
<p>This is your space for deeper, more introspective writing. Use this editor to explore:</p>
<ul>
<li><strong>Personal reflections</strong> - Process your thoughts and feelings</li>
<li><strong>Creative writing</strong> - Dive into poetry, stories, or stream-of-consciousness</li>
<li><strong>Problem solving</strong> - Work through challenges with thoughtful analysis</li>
</ul>
<p>Try typing some text and then use <strong>/rewrite</strong> followed by <strong>Ctrl+Enter</strong> to make it more contemplative!</p>
<p>You can also type words like "sad" to create interactive elements. <em>Begin your thoughtful writing below...</em></p>`;
  }
};

export function PlateEditor({ roomId, mood }: PlateEditorProps) {
  const initialValue = [
    {
      type: 'p',
      children: [{ text: getStarterText(mood).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }],
    },
  ];
  
  const [value, setValue] = useLocalStorage(`editor-${mood}`, initialValue);
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [yDoc, setYDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const isRemoteUpdateRef = useRef(false);

  // Use the AI hook for rewriting text
  const { isProcessing, error: aiError, rewrite, clearError } = useAI({
    mood,
    onSuccess: (result) => {
      console.log(`AI rewrite successful for ${mood} mode:`, result);
    },
    onError: (error) => {
      console.error(`AI rewrite failed for ${mood} mode:`, error);
    },
  });

  // Set up Yjs collaboration
  useEffect(() => {
    if (roomId) {
      const doc = new Y.Doc();
      const webrtcProvider = new WebrtcProvider(`civic-editor-${roomId}`, doc, {
        signaling: ['wss://signaling.yjs.dev'],
      });

      setYDoc(doc);
      setProvider(webrtcProvider);

      // Listen for awareness changes (other users)
      webrtcProvider.awareness.on('change', () => {
        const states = Array.from(webrtcProvider.awareness.getStates().values());
        const users = states
          .filter((state: any) => state.user?.name)
          .map((state: any) => state.user.name);
        setCollaborators(users);
      });

      // Set current user info
      webrtcProvider.awareness.setLocalStateField('user', {
        name: `User${Math.floor(Math.random() * 1000)}`,
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
      });

      return () => {
        webrtcProvider.destroy();
        doc.destroy();
      };
    }
  }, [roomId]);

  // Typing indicator
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    const handleTyping = () => {
      setIsTyping(true);
      if (provider) {
        provider.awareness.setLocalStateField('typing', true);
      }
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        setIsTyping(false);
        if (provider) {
          provider.awareness.setLocalStateField('typing', false);
        }
      }, 1000);
    };

    if (provider) {
      // Listen for typing indicators from other users
      provider.awareness.on('change', () => {
        const states = Array.from(provider.awareness.getStates().values());
        const someoneTyping = states.some((state: any) => state.typing && state.user?.name);
        setIsTyping(someoneTyping);
      });
    }

    return () => clearTimeout(typingTimeout);
  }, [provider]);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    // Handle basic formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          return;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          return;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          return;
      }
    }

    // Handle AI rewrite
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      const text = target.textContent || '';

              if (text.includes('/rewrite')) {
          // Extract text after /rewrite command
          const lines = text.split('\n');
          const rewriteLine = lines.find(line => line.includes('/rewrite'));

          if (rewriteLine) {
            const textToRewrite = rewriteLine.replace('/rewrite', '').trim();

            if (textToRewrite) {
              try {
                const rewrittenText = await rewrite(textToRewrite);

                if (rewrittenText) {
                  // Replace the /rewrite line with the rewritten text
                  const newLines = lines.map(line =>
                    line.includes('/rewrite') ? rewrittenText : line
                  );

                  const newContent = newLines.join('\n');
                  target.innerHTML = newContent.replace(/\n/g, '<br>');
                  const newValue = [{ type: 'p', children: [{ text: newContent }] }];
                  setValue(newValue);
                  syncContentChange(newValue);
                }
              } catch (error) {
                console.error('Error rewriting text:', error);
                // Show error in the editor
                const errorText = `<p style="color: red;">Error: Could not rewrite text. ${error}</p>`;
                target.innerHTML = target.innerHTML.replace('/rewrite ' + textToRewrite, errorText);
              }
            }
          }
        }
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    // Don't update during remote updates to avoid conflicts
    if (isRemoteUpdateRef.current) return;
    
    const newContent = e.currentTarget.textContent || '';
    const newValue = [{ type: 'p', children: [{ text: newContent }] }];
    
    // Only update if content actually changed to avoid cursor jumps
    const currentContent = Array.isArray(value) 
      ? value.map(node => node.children?.map((child: any) => child.text).join('') || '').join('\n')
      : value;
    
    if (newContent !== currentContent) {
      setValue(newValue);
      syncContentChange(newValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Create plugins with basic collaboration simulation
  const plugins = useMemo(() => [
    createParagraphPlugin(),
    createHeadingPlugin(),
    createBoldPlugin(),
    createItalicPlugin(),
    createUnderlinePlugin(),
    createListPlugin(),
  ], []);

  // Sync content changes to other collaborators
  const syncContentChange = (content: any) => {
    if (yDoc && provider) {
      const yText = yDoc.getText('content');
      const currentText = typeof content === 'string' ? content : JSON.stringify(content);
      if (yText.toString() !== currentText) {
        yText.delete(0, yText.length);
        yText.insert(0, currentText);
      }
    }
  };

  // Listen for remote content changes
  useEffect(() => {
    if (yDoc && provider) {
      const yText = yDoc.getText('content');
      
      const observer = () => {
        const remoteContent = yText.toString();
        if (remoteContent && remoteContent !== JSON.stringify(value)) {
          isRemoteUpdateRef.current = true;
          try {
            const parsedContent = JSON.parse(remoteContent);
            setValue(parsedContent);
          } catch {
            // If it's just text, create a paragraph node
            setValue([{ type: 'p', children: [{ text: remoteContent }] }]);
          }
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 100);
        }
      };

      yText.observe(observer);
      return () => yText.unobserve(observer);
    }
  }, [yDoc, provider, value]);

  // Load content into contentEditable div with cursor preservation
  useEffect(() => {
    if (editorRef.current && value) {
      const editor = editorRef.current;
      
      const content = Array.isArray(value) 
        ? value.map(node => node.children?.map((child: any) => child.text).join('') || '').join('\n')
        : value;
      
      // Only update if content actually changed and we're not typing
      const currentText = editor.textContent || '';
      const newText = content.replace(/\n/g, '\n');
      
      if (currentText !== newText && isRemoteUpdateRef.current) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        
        // Save cursor position
        let cursorPosition = 0;
        if (range && editor.contains(range.startContainer)) {
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editor);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          cursorPosition = preCaretRange.toString().length;
        }

        editor.innerHTML = content.replace(/\n/g, '<br>');
        
        // Restore cursor position only if we had one
        if (cursorPosition > 0 && selection) {
          const textNodes: Text[] = [];
          const walker = document.createTreeWalker(
            editor,
            NodeFilter.SHOW_TEXT,
            null
          );
          
          let node;
          while (node = walker.nextNode()) {
            textNodes.push(node as Text);
          }
          
          let charCount = 0;
          for (const textNode of textNodes) {
            const textLength = textNode.textContent?.length || 0;
            if (charCount + textLength >= cursorPosition) {
              const offset = cursorPosition - charCount;
              selection.removeAllRanges();
              const newRange = document.createRange();
              newRange.setStart(textNode, Math.min(offset, textLength));
              newRange.setEnd(textNode, Math.min(offset, textLength));
              selection.addRange(newRange);
              break;
            }
            charCount += textLength;
          }
        }
      } else if (currentText === '' && newText !== '') {
        // Initial load case
        editor.innerHTML = content.replace(/\n/g, '<br>');
      }
    }
  }, [value]);

  return (
    <div className="editor-container">
      <div
        ref={editorRef}
        className="plate-editor"
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={`Start writing your ${mood} thoughts... Type /rewrite + Ctrl+Enter to transform text with AI.`}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
        }}
      />
      
            {isProcessing && (
        <div className="info-bar">
          <div className="info-item">
            <span>🤖 AI is rewriting your text with OpenAI...</span>
          </div>
        </div>
      )}

      {aiError && (
        <div className="info-bar">
          <div className="info-item">
            <span style={{ color: '#ff6b6b' }}>⚠️ {aiError}</span>
            <button 
              onClick={clearError}
              style={{ 
                marginLeft: '1rem', 
                padding: '0.25rem 0.5rem', 
                fontSize: '0.75rem',
                background: 'transparent',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {!isProcessing && !aiError && (
        <div className="info-bar">
          <div className="info-item">
            <span>📝 {mood === 'happy' ? 'Happy' : 'Sad'} Editor</span>
          </div>
          <div className="info-item">
            <span>Ctrl+B/I/U for formatting • /rewrite + Ctrl+Enter for AI</span>
          </div>
          {roomId && (
            <div className="info-item">
              <span>🤝 Room: {roomId}</span>
              {collaborators.length > 0 && (
                <span> • 👥 {collaborators.join(', ')}</span>
              )}
              {isTyping && <span> • ✍️ typing...</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
