'use client';

import React, { useState, useRef, useEffect } from 'react';
// import { createYjsPlugin } from '@udecode/plate-yjs'; // Package doesn't exist in current version
import { HappyElement } from './HappyElement';
import { SadElement } from './SadElement';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAI } from '../../hooks/useAI';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';

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
  const [provider, setProvider] = useState<WebrtcProvider | WebsocketProvider | null>(null);
  const [providerType, setProviderType] = useState<'webrtc' | 'websocket' | 'none'>('none');
  const [editorContent, setEditorContent] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const editorRef = useRef<HTMLDivElement>(null);
  const isRemoteUpdateRef = useRef(false);
  const isLocalUpdateRef = useRef(false);

  // Use the AI hook for rewriting text
  const { isProcessing, error: aiError, rewrite, clearError } = useAI({
    mood,
    onSuccess: (result: string) => {
      console.log(`AI rewrite successful for ${mood} mode:`, result);
    },
    onError: (error: Error) => {
      console.error(`AI rewrite failed for ${mood} mode:`, error);
    },
  });

  // Set up Yjs collaboration with fallback
  useEffect(() => {
    if (roomId) {
      console.log(`🔗 Setting up collaboration for room: ${roomId}`);
      
      const doc = new Y.Doc();
      let activeProvider: WebrtcProvider | WebsocketProvider;
      
      // Detect if we're in incognito mode or have WebRTC restrictions
      const isIncognitoOrRestricted = async (): Promise<boolean> => {
        try {
          // Multiple methods to detect incognito mode
          
          // Method 1: Storage quota check
          if ('storage' in navigator && 'estimate' in navigator.storage) {
            const quota = await navigator.storage.estimate();
            if (quota.quota && quota.quota < 120000000) { // Less than ~120MB indicates incognito
              return true;
            }
          }
          
          // Method 2: WebkitTemporaryStorage (Chrome)
          if ((navigator as any).webkitTemporaryStorage) {
            return new Promise<boolean>(resolve => {
              (navigator as any).webkitTemporaryStorage.queryUsageAndQuota(
                (_: number, quota: number) => resolve(quota === 0),
                () => resolve(true)
              );
            });
          }
          
          // Method 3: IndexedDB check
          if (!window.indexedDB) {
            return true;
          }
          
          // Method 4: Try to create a test storage
          try {
            const testKey = '__incognito_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return false; // If we can use localStorage, probably not incognito
          } catch {
            return true; // If localStorage fails, likely incognito
          }
        } catch {
          return true; // If any error, assume restricted
        }
      };

      const setupWebSocketProvider = () => {
        console.log('🌐 Using WebSocket provider (incognito-friendly)');
        setProviderType('websocket');
        
        // Use a public Yjs WebSocket server (you can replace with your own)
        const wsProvider = new WebsocketProvider('wss://demos.yjs.dev', `civic-${roomId}`, doc);
        
        wsProvider.on('status', (event: any) => {
          console.log(`📡 WebSocket status: ${event.status}`);
          setConnectionStatus(event.status);
        });

        wsProvider.on('synced', (event: any) => {
          console.log('🔄 WebSocket synced:', event);
          setConnectionStatus('synced');
        });

        // Setup awareness for WebSocket
        wsProvider.awareness.on('change', () => {
          const states = Array.from(wsProvider.awareness.getStates().values());
          const localClientId = wsProvider.awareness.clientID;
          const users = states
            .filter((state: unknown) => {
              const stateObj = state as { user?: { name: string } };
              return stateObj.user?.name && wsProvider.awareness.getStates().get(localClientId) !== state;
            })
            .map((state: unknown) => (state as { user: { name: string } }).user.name);
          setCollaborators(users);
          console.log(`👥 WebSocket Collaborators: ${users.join(', ')}`);
        });

        return wsProvider;
      };

      const setupWebRTCProvider = () => {
        console.log('🌐 Using WebRTC provider (P2P)');
        setProviderType('webrtc');
        
        const webrtcProvider = new WebrtcProvider(`civic-${roomId}`, doc, {
          signaling: [
            'wss://signaling.yjs.dev',
            'wss://y-webrtc-signaling-eu.herokuapp.com',
            'wss://y-webrtc-signaling-us.herokuapp.com'
          ],
          password: null,
          awareness: doc.awareness,
          maxConns: 20 + Math.floor(Math.random() * 15),
          filterBcConns: true,
          peerOpts: {}
        });

        webrtcProvider.on('status', (event: any) => {
          console.log(`🌐 WebRTC status: ${event.status}`);
          setConnectionStatus(event.status);
        });

        webrtcProvider.on('synced', (event: any) => {
          console.log('🔄 WebRTC synced:', event);
          setConnectionStatus('synced');
        });

        webrtcProvider.on('peers', (event: any) => {
          console.log(`🤝 WebRTC peers: ${event.added?.length || 0} added, ${event.removed?.length || 0} removed`);
          if (event.added?.length > 0) {
            setConnectionStatus('connected');
          }
        });

        webrtcProvider.awareness.on('change', () => {
          const states = Array.from(webrtcProvider.awareness.getStates().values());
          const localClientId = webrtcProvider.awareness.clientID;
          const users = states
            .filter((state: unknown) => {
              const stateObj = state as { user?: { name: string } };
              return stateObj.user?.name && webrtcProvider.awareness.getStates().get(localClientId) !== state;
            })
            .map((state: unknown) => (state as { user: { name: string } }).user.name);
          setCollaborators(users);
          console.log(`👥 WebRTC Collaborators: ${users.join(', ')}`);
        });

        return webrtcProvider;
      };

      // Try WebRTC first, fallback to WebSocket
      isIncognitoOrRestricted().then((isRestricted) => {
        if (isRestricted) {
          activeProvider = setupWebSocketProvider();
        } else {
          activeProvider = setupWebRTCProvider();
          
          // If WebRTC fails to connect after 5 seconds, fallback to WebSocket
          setTimeout(() => {
            if (connectionStatus === 'disconnected' || connectionStatus === 'connecting') {
              console.log('🔄 WebRTC connection timeout, falling back to WebSocket');
              activeProvider.destroy();
              activeProvider = setupWebSocketProvider();
              setProvider(activeProvider);
            }
          }, 5000);
        }
        
        setProvider(activeProvider);
      });

      setYDoc(doc);

      // Set current user info
      const userName = `User${Math.floor(Math.random() * 1000)}`;
      
      // Wait a bit for provider setup then set user info
      setTimeout(() => {
        if (activeProvider && activeProvider.awareness) {
          activeProvider.awareness.setLocalStateField('user', {
            name: userName,
            color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            typing: false,
          });
        }
      }, 500);

      // Handle initial content sync
      const setupInitialContent = () => {
        const yText = doc.getText('content');
        if (yText.length === 0) {
          const currentContent = Array.isArray(value) 
            ? value.map(node => node.children?.map((child: { text: string }) => child.text).join('') || '').join('\n')
            : '';
          
          const starterText = getStarterText(mood).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          if (currentContent && currentContent !== starterText) {
            console.log(`📝 Setting initial content for room ${roomId}`);
            yText.insert(0, currentContent);
          }
        }
      };

      setTimeout(setupInitialContent, 1500);

      return () => {
        console.log(`🔌 Disconnecting from room: ${roomId}`);
        if (activeProvider) {
          activeProvider.destroy();
        }
        doc.destroy();
      };
    }
  }, [roomId]);

  // Typing indicator and input handler
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;
    
    const handleTyping = () => {
      if (provider) {
        provider.awareness.setLocalStateField('typing', true);
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          provider.awareness.setLocalStateField('typing', false);
        }, 1000);
      }
    };

    if (provider) {
      // Listen for typing indicators from other users
      const awarenessHandler = () => {
        const states = Array.from(provider.awareness.getStates().values());
        const localClientId = provider.awareness.clientID;
        const someoneElseTyping = states.some((state: unknown) => {
          const stateObj = state as { typing?: boolean; user?: { name: string } };
          return stateObj.typing && stateObj.user?.name && provider.awareness.getStates().get(localClientId) !== state;
        });
        setIsTyping(someoneElseTyping);
      };
      
      provider.awareness.on('change', awarenessHandler);
      
      // Add input event listener to trigger typing indicator
      const editor = editorRef.current;
      if (editor) {
        editor.addEventListener('input', handleTyping);
        editor.addEventListener('keydown', handleTyping);
      }
      
      return () => {
        clearTimeout(typingTimeout);
        provider.awareness.off('change', awarenessHandler);
        if (editor) {
          editor.removeEventListener('input', handleTyping);
          editor.removeEventListener('keydown', handleTyping);
        }
      };
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
    if (isRemoteUpdateRef.current) {
      console.log('⏸️ Skipping input during remote update');
      return;
    }
    
    const newContent = e.currentTarget.textContent || '';
    const newValue = [{ type: 'p', children: [{ text: newContent }] }];
    
    // Update the editor content state for interactive overlay
    setEditorContent(newContent);
    
    // Only update if content actually changed to avoid cursor jumps
    const currentContent = Array.isArray(value) 
      ? value.map(node => node.children?.map((child: any) => child.text).join('') || '').join('\n')
      : value;
    
    if (newContent !== currentContent) {
      console.log(`📤 Sending local update: "${newContent.substring(0, 50)}..."`);
      isLocalUpdateRef.current = true;
      setValue(newValue);
      syncContentChange(newValue);
      setTimeout(() => {
        isLocalUpdateRef.current = false;
      }, 50);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };



  // Sync content changes to other collaborators
  const syncContentChange = (content: unknown) => {
    if (yDoc && provider) {
      const yText = yDoc.getText('content');
      // Extract plain text from content for better collaboration
      const textContent = Array.isArray(content) 
        ? content.map(node => node.children?.map((child: { text: string }) => child.text).join('') || '').join('\n')
        : typeof content === 'string' ? content : '';
      
      if (yText.toString() !== textContent) {
        yText.delete(0, yText.length);
        yText.insert(0, textContent);
      }
    }
  };

  // Listen for remote content changes
  useEffect(() => {
    if (yDoc && provider) {
      const yText = yDoc.getText('content');
      
      const observer = () => {
        const remoteContent = yText.toString();
        const currentContent = Array.isArray(value) 
          ? value.map(node => node.children?.map((child: { text: string }) => child.text).join('') || '').join('\n')
          : '';
          
        if (remoteContent !== currentContent) {
          console.log(`📥 Received remote update: "${remoteContent.substring(0, 50)}..."`);
          isRemoteUpdateRef.current = true;
          
          // Update both the state and editor content
          const newValue = [{ type: 'p', children: [{ text: remoteContent }] }];
          setValue(newValue);
          setEditorContent(remoteContent);
          
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 150);
        }
      };

      yText.observe(observer);
      
      // Also listen for when the document gets loaded with existing content
      if (yText.length > 0) {
        observer(); // Trigger initial load
      }
      
      return () => yText.unobserve(observer);
    }
  }, [yDoc, provider, setValue]);

  // Only update editor content for remote changes and initial load
  useEffect(() => {
    if (!editorRef.current || !value) return;
    
    const editor = editorRef.current;
    const content = Array.isArray(value) 
      ? value.map(node => node.children?.map((child: { text: string }) => child.text).join('') || '').join('\n')
      : value;
    
    const currentText = editor.textContent || '';
    const newText = content.replace(/\n/g, '\n');
    
    // Only update the DOM in these specific cases:
    // 1. Initial load (empty editor)
    // 2. Remote updates (not local typing)
    if (currentText === '' || (isRemoteUpdateRef.current && !isLocalUpdateRef.current)) {
      if (currentText !== newText) {
        console.log(`🔄 Updating editor DOM: ${isRemoteUpdateRef.current ? 'remote' : 'initial'}`);
        
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        
        // Save cursor position only for remote updates
        let cursorPosition = 0;
        if (isRemoteUpdateRef.current && range && editor.contains(range.startContainer)) {
          const preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(editor);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          cursorPosition = preCaretRange.toString().length;
        }

        editor.innerHTML = content.replace(/\n/g, '<br>');
        
        // Restore cursor position only for remote updates
        if (isRemoteUpdateRef.current && selection && cursorPosition > 0) {
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
      }
    }
  }, [value]);

  // Render happy/sad words as interactive elements
  const renderInteractiveText = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    
    // Find happy words
    const happyRegex = /\bhappy\b/gi;
    let match;
    
    const allMatches: Array<{index: number, length: number, type: 'happy' | 'sad', text: string}> = [];
    
    // Collect happy matches
    while ((match = happyRegex.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: 'happy',
        text: match[0]
      });
    }
    
    // Find sad words
    const sadRegex = /\bsad\b/gi;
    while ((match = sadRegex.exec(text)) !== null) {
      allMatches.push({
        index: match.index,
        length: match[0].length,
        type: 'sad',
        text: match[0]
      });
    }
    
    // Sort matches by index
    allMatches.sort((a, b) => a.index - b.index);
    
    // Build the result
    allMatches.forEach((match, i) => {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      
      // Add the interactive element
      if (match.type === 'happy') {
        parts.push(
          <HappyElement key={`happy-${i}`}>
            {match.text}
          </HappyElement>
        );
      } else {
        parts.push(
          <SadElement key={`sad-${i}`}>
            {match.text}
          </SadElement>
        );
      }
      
      lastIndex = match.index + match.length;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : [text];
  };

  // Parse editor content and render with interactive elements
  /* const parseAndRenderContent = () => {
    const content = editorContent || (editorRef.current?.textContent || '');
    if (!content || (!content.includes('happy') && !content.includes('sad'))) {
      return null;
    }
    
    return (
      <div className="interactive-overlay">
        {renderInteractiveText(content)}
      </div>
    );
  }; */

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
      
      {/* Show interactive elements when happy/sad words are detected */}
      {editorContent && (editorContent.includes('happy') || editorContent.includes('sad')) && (
        <div className="interactive-hints" style={{
          position: 'fixed',
          bottom: '80px',
          right: '2rem',
          background: 'hsl(var(--background))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          maxWidth: '300px',
          zIndex: 10
        }}>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'hsl(var(--foreground))' }}>
            Click on highlighted words for inspiring quotes.
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            {renderInteractiveText(editorContent)}
          </div>
        </div>
      )}
      
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
                          <span> • {providerType === 'webrtc' ? '🌐' : '📡'} {connectionStatus} ({providerType})</span>
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
