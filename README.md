# Civic Text Editor

A modern text editor built with Next.js that offers AI-powered content rewriting and interactive elements. Created for the Civic Engineering Team project.

## Features

### Dual Editor Modes
- **Happy Editor**: Transforms text to be more positive and uplifting
- **Sad Editor**: Rewrites content to be more contemplative and introspective
- Switch between modes on the main page

### AI Text Rewriting
- Type `/rewrite [your text]` and press Ctrl+Enter to transform content
- Uses OpenAI's API for intelligent text transformation
- Context-aware changes based on the selected editor mode

### Interactive Text Elements
- Words like "happy" and "sad" become clickable elements
- Click on highlighted words to see inspiring quotes
- Quotes are randomly selected from curated collections

### Text Editing
- Basic formatting with Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline)
- Clean, minimal interface focused on writing
- Auto-save to local storage

### Real-time Collaboration
- Enter a room ID to collaborate with others
- Real-time synchronization using Yjs and WebRTC
- See other users and typing indicators

## How to Use

### Basic Writing
1. Choose either Happy or Sad editor from the main page
2. Start typing in the editor
3. Use keyboard shortcuts for formatting:
   - Ctrl+B for bold
   - Ctrl+I for italic
   - Ctrl+U for underline

### AI Rewriting
1. Type your text
2. Add `/rewrite ` before the text you want to transform
3. Press Ctrl+Enter
4. The AI will rewrite the text according to the editor mode

### Collaboration
1. Enter a room ID (any text works)
2. Click "Start Writing" 
3. Share the same room ID with others
4. Write together in real-time

### Interactive Elements
- Type "happy" or "sad" in your text
- These words will appear highlighted
- Click on them in the hint panel to see random quotes

## Project Structure

```
src/
├── app/
│   ├── happy/page.tsx          # Happy editor page
│   ├── sad/page.tsx            # Sad editor page  
│   ├── layout.tsx              # Main layout and navigation
│   └── page.tsx                # Landing page
├── components/
│   ├── editor/
│   │   ├── PlateEditor.tsx     # Main editor component
│   │   ├── AISlashCommand.tsx
│   │   ├── CollaborationPlugin.tsx
│   │   ├── HappyElement.tsx    # Happy text element
│   │   └── SadElement.tsx      # Sad text element
│   └── ui/
│       ├── popover.tsx (shadcn)
│       ├── button.tsx (shadcn)
│       └── quote-popover.tsx
├── hooks/
│   ├── useAI.ts                # OpenAI integration hook
│   └── useLocalStorage.ts      # Local storage management
└── lib/
    ├── ai.ts                   # AI text transformation
    ├── plate-config.ts         # Plate.js editor configuration
    ├── collaboration.ts        # Real-time collaboration utilities
    └── quotes.ts               # Quote collections
└── types/
    ├── index.ts                # Main type definitions
    └── plate-elements.ts       # Plate element type definitions
```

## Technical Details

Built with:
- Next.js 15 with App Router
- React 19
- TypeScript for type safety
- Tailwind CSS for styling
- OpenAI API for text transformation
- Yjs for real-time collaboration
- WebRTC for peer-to-peer communication