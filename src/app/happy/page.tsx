'use client';

import { useState } from 'react';
import { PlateEditor } from "../../components/editor/PlateEditor";

export default function HappyPage() {
  const [roomId, setRoomId] = useState('');
  const [isCollaborating, setIsCollaborating] = useState(false);

  const handleStartCollaboration = () => {
    setIsCollaborating(true);
  };

  if (!isCollaborating) {
    return (
      <div className="editor-container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          maxWidth: '500px',
          margin: '0 auto',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: '2rem', color: 'hsl(var(--foreground))' }}>
            Happy Editor
          </h1>
          
          <div style={{ marginBottom: '2rem', width: '100%' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              color: 'hsl(var(--foreground))',
              fontSize: '0.875rem'
            }}>
              Room ID (optional - for collaboration):
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room ID or leave empty for solo editing"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid hsl(var(--border))',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                backgroundColor: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                outline: 'none'
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleStartCollaboration()}
            />
          </div>

          <button
            onClick={handleStartCollaboration}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              border: '2px solid hsl(var(--foreground))',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Start Writing
          </button>

          <p style={{ 
            marginTop: '1rem', 
            fontSize: '0.75rem', 
            color: 'hsl(var(--muted-foreground))' 
          }}>
            Share the same Room ID with others to collaborate in real-time
          </p>
        </div>
      </div>
    );
  }

  return <PlateEditor mood="happy" roomId={roomId || undefined} />;
}