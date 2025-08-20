'use client';

import * as React from 'react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import { RemoteCursorOverlay } from '../ui/remote-cursor-overlay';

export interface CollaborationConfig {
  roomId?: string;
  username?: string;
  cursorColor?: string;
}

interface CollaborationState {
  isConnected: boolean;
  providers: Array<{
    type: 'webrtc' | 'websocket';
    isConnected: boolean;
  }>;
  cursors: Array<{
    clientId: string;
    data?: { color: string; name: string };
    caretPosition?: React.CSSProperties;
    selectionRects: React.CSSProperties[];
  }>;
}

export function useCollaborationPlugin(config: CollaborationConfig = {}) {
  const [yDoc, setYDoc] = React.useState<Y.Doc | null>(null);
  const [providers, setProviders] = React.useState<Array<WebrtcProvider | WebsocketProvider>>([]);
  const [state, setState] = React.useState<CollaborationState>({
    isConnected: false,
    providers: [],
    cursors: []
  });

  React.useEffect(() => {
    if (!config.roomId) return;

    const doc = new Y.Doc();
    setYDoc(doc);

    const setupProviders = async () => {
      const newProviders: Array<WebrtcProvider | WebsocketProvider> = [];
      
      try {
        const webrtcProvider = new WebrtcProvider(`civic-${config.roomId}`, doc, {
          signaling: [
            process.env.NODE_ENV === 'production'
              ? 'wss://signaling.yjs.dev'
              : 'ws://localhost:4444',
          ],
        });
        
        if (config.username && config.cursorColor) {
          webrtcProvider.awareness.setLocalStateField('user', {
            name: config.username,
            color: config.cursorColor,
          });
        }

        newProviders.push(webrtcProvider);
      } catch (error) {
        // WebRTC provider failed, using WebSocket fallback
      }
      const wsProvider = new WebsocketProvider(
        'wss://demos.yjs.dev', 
        `civic-${config.roomId}`, 
        doc
      );
      
      if (config.username && config.cursorColor) {
        wsProvider.awareness.setLocalStateField('user', {
          name: config.username,
          color: config.cursorColor,
        });
      }

      newProviders.push(wsProvider);
      setProviders(newProviders);


      newProviders.forEach((provider) => {
        provider.on('status', ({ status }: { status: string }) => {
          setState(prev => ({
            ...prev,
            isConnected: status === 'connected',
            providers: prev.providers.map(p => 
              p.type === (provider instanceof WebrtcProvider ? 'webrtc' : 'websocket')
                ? { ...p, isConnected: status === 'connected' }
                : p
            )
          }));
        });

        if (provider.awareness) {
          provider.awareness.on('change', () => {
            const states = Array.from(provider.awareness.getStates().values());
            const cursors = states
              .filter(state => state.user)
              .map((state, index) => ({
                clientId: `client-${index}`,
                data: state.user,
                caretPosition: undefined,
                selectionRects: []
              }));
            
            setState(prev => ({ ...prev, cursors }));
          });
        }
      });
    };

    setupProviders();

    return () => {
      providers.forEach(provider => {
        provider.destroy();
      });
      doc.destroy();
    };
  }, [config.roomId, config.username, config.cursorColor]);

  const disconnect = React.useCallback(() => {
    providers.forEach(provider => {
      provider.disconnect();
    });
    setState(prev => ({ ...prev, isConnected: false }));
  }, [providers]);

  const connect = React.useCallback(() => {
    providers.forEach(provider => {
      provider.connect();
    });
  }, [providers]);

  return {
    yDoc,
    isConnected: state.isConnected,
    providers: state.providers,
    cursors: state.cursors,
    disconnect,
    connect,
    RemoteCursorOverlay: () => <RemoteCursorOverlay cursors={state.cursors} />
  };
}

// Utility function to generate random room IDs
export const generateRoomId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 21; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
