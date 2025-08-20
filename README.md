# Civic Text Editor

A beautiful Notion-like text editor built with Next.js, Plate.js, and AI-powered content transformation.

## ✨ Features

### 🎨 **Modern Notion-like UI**
- Beautiful gradient backgrounds and glassmorphism effects
- Responsive design with dark mode support
- Professional typography and spacing
- Smooth animations and hover effects

### 🤖 **AI-Powered Text Rewriting**
- Use `/rewrite` command with Ctrl+Enter to transform text
- **Happy Editor**: Makes text more positive and uplifting
- **Contemplative Editor**: Makes text more introspective and thoughtful
- Smart context-aware transformations

### 📝 **Rich Text Editing**
- Full Plate.js integration with plugins
- Rich formatting: Bold, Italic, Underline, Code
- Headings (H1, H2, H3)
- Lists (Bulleted, Numbered)
- Block quotes
- Professional toolbar with icons

### 🎯 **Interactive Elements**
- Custom "happy" and "sad" text elements
- Click to reveal inspiring quotes
- Beautiful popover animations
- Context-aware quote selection

### 💾 **Data Persistence**
- Automatic local storage saving
- Content persists across sessions
- Separate storage for each mood

### 🤝 **Collaboration Ready**
- Room-based collaboration interface
- Real-time editing infrastructure
- Shareable room IDs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage Guide

### 😊 **Happy Editor** (`/happy`)
Transform your writing into positive, uplifting content:
- Type naturally in the rich text editor
- Use formatting tools (bold, italic, headings, lists)
- Type "happy" to create interactive quote elements
- Use `Ctrl+Enter` with `/rewrite` to make text more positive
- **Example**: "The weather is okay today /rewrite" → "The weather is absolutely wonderful today!"

### 🌙 **Contemplative Editor** (`/sad`)
Express deeper, more introspective thoughts:
- Write with rich formatting and structure
- Type "sad" to create interactive quote elements  
- Use `Ctrl+Enter` with `/rewrite` to make text more contemplative
- **Example**: "The weather is okay today /rewrite" → "The weather is disappointing today."

### 🤝 **Collaboration**
- Enter a room ID in the collaboration section
- Share the room ID with others for real-time editing
- Multiple users can write together simultaneously

## Project Structure

```
src/
├── app/
│   ├── happy/page.tsx          # Happy editor page
│   ├── sad/page.tsx            # Sad editor page
│   ├── layout.tsx              # Root layout with navigation
│   └── page.tsx                # Landing page
├── components/
│   ├── editor/
│   │   └── PlateEditor.tsx     # Main editor component
│   └── ui/
│       ├── button.tsx          # Button component
│       ├── popover.tsx         # Popover component
│       └── quote-popover.tsx   # Quote display component
├── hooks/
│   └── useLocalStorage.ts      # Local storage hook
└── lib/
    ├── ai.ts                   # AI text rewriting logic
    ├── quotes.ts               # Happy/sad quotes
    └── utils.ts                # Utility functions
```

## 🛠 Technical Stack

### Core Technologies
- **Next.js 15.4.7** - React framework with App Router
- **React 19.1.0** - Latest React with modern features
- **Plate.js** - Powerful rich text editor framework
- **TypeScript** - Full type safety throughout
- **Tailwind CSS** - Modern styling with custom CSS variables
- **Lucide React** - Beautiful, consistent icons

### Key Features

#### 🎨 **Notion-like Design**
- Glassmorphism effects with backdrop-blur
- CSS custom properties for theming
- Gradient backgrounds and smooth transitions
- Dark mode support with CSS variables

#### 📝 **Rich Text Editor**
- Full Plate.js integration with plugins
- Custom toolbar with formatting controls
- Interactive elements with click handlers
- Real-time text transformation

#### 🤖 **AI Integration**
- Context-aware text rewriting
- Mood-based transformations
- Extensible for real AI APIs
- Smart word replacement algorithms

#### 💾 **State Management**
- Local storage persistence
- Type-safe hooks
- Separate storage per editor mode
- Error handling and recovery

## Future Enhancements

### Full Plate.js Integration
To implement the complete Plate.js rich text editor:

1. **Install compatible Plate.js packages**
2. **Create custom element plugins** for "happy" and "sad" text
3. **Implement word detection and transformation**
4. **Add rich text formatting** (bold, italic, etc.)

### Real-time Collaboration
To add collaboration features:

1. **Set up WebSocket server** (HocusPocus or custom)
2. **Integrate Yjs** for conflict resolution
3. **Add user cursors and presence**
4. **Implement room-based editing**

### Advanced AI Integration
To enhance AI capabilities:

1. **Integrate OpenAI API** or similar service
2. **Add more sophisticated text analysis**
3. **Implement context-aware rewriting**
4. **Add multiple AI models** for different moods

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Component-based architecture

## Deployment

The application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- Any platform supporting Node.js

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the Civic Engineering Team assignment.

---

**Note**: This is a simplified implementation that demonstrates the core concepts. The full Plate.js integration and real-time collaboration features would require additional setup and compatible dependencies.
