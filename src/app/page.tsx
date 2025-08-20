'use client';

import Link from "next/link";

export default function Home() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'hsl(var(--background))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '1rem',
          color: 'hsl(var(--foreground))'
        }}>
          Civic Editor
        </h1>
        
        <p style={{
          fontSize: '1.125rem',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '3rem',
          lineHeight: '1.6'
        }}>
          A minimal text editor with AI rewriting and real-time collaboration.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <Link 
            href="/happy" 
            className="home-button primary"
          >
            Happy Editor
          </Link>
          
          <Link 
            href="/sad"
            className="home-button secondary"
          >
            Sad Editor
          </Link>
        </div>
        
        <div style={{
          marginTop: '3rem',
          fontSize: '0.875rem',
          color: 'hsl(var(--muted-foreground))',
          display: 'flex',
          gap: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <span>AI Text Rewriting</span>
          <span>Real-time Collaboration</span>
          <span>Interactive Elements</span>
        </div>
      </div>
    </div>
  );
}