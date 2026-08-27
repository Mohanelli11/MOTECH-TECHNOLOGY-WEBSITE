# Development Guide

## Project Setup

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher (or yarn/pnpm)

### Installation

```bash
# Clone repository
git clone https://github.com/Mohanelli11/MOTECH-TECHNOLOGY-WEBSITE.git
cd MOTECH-TECHNOLOGY-WEBSITE

# Install dependencies
npm install

# Create .env.local from example
cp .env.example .env.local
```

## Development Server

```bash
# Start development server with hot reload
npm run dev

# The app will open at http://localhost:5173
```

## Building

```bash
# Production build
npm run build

# Preview production build locally
npm run preview
```

## Code Quality

```bash
# Lint TypeScript and React code
npm run lint

# Format code with Prettier
npm run format

# Check code formatting without changes
npm run format:check
```

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components (routes)
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
├── data/            # Static data & constants
├── assets/          # Images, fonts, etc.
├── styles/          # Global styles
├── App.tsx          # Root component
└── index.tsx        # Entry point
```

## Key Technologies

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool & dev server
- **Tailwind CSS**: Utility-first CSS
- **React Router v6**: Navigation
- **Framer Motion**: Animations
- **Lucide React**: Icon library
- **Emotion**: CSS-in-JS

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check formatting |

## Environment Variables

See `.env.example` for all available variables. Create `.env.local` for local overrides.

### Key Variables

- `VITE_API_URL`: Backend API endpoint
- `VITE_ENERGY_DASHBOARD_URL`: Smart Energy dashboard URL
- `VITE_ENABLE_ANALYTICS`: Enable analytics tracking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Debugging

### Console Logging

```typescript
console.log('Debug message');
console.error('Error:', error);
console.table(data);
```

### React DevTools

- Install [React DevTools](https://react-devtools-tutorial.vercel.app/) extension
- Inspect component tree and state
- Profile component performance

### Vite Debug

Set `VITE_ENABLE_DEBUG_MODE=true` in `.env.local` for additional logging.

## Performance Optimization

- Use React.memo for expensive components
- Implement code splitting with lazy routes
- Optimize images and assets
- Monitor bundle size with `npm run build`

## Testing (When Implemented)

```bash
npm test                  # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Deployment

### Build Artifact

- Output directory: `dist/`
- Static files ready for hosting
- Environment-specific builds via environment variables

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Code formatted and linted
- [ ] Environment variables configured
- [ ] Build completes without errors
- [ ] Bundle size acceptable
- [ ] No console errors/warnings

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 5173
lsof -ti:5173 | xargs kill -9

# Or specify different port
npm run dev -- --port 3000
```

### Module Not Found

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `npm cache clean --force`

### Build Fails

```bash
# Clean build
rm -rf dist
npm run build
```

### Hot Module Reload Not Working

- Check browser console for errors
- Restart dev server
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/en/main)

## Questions?

Contact: [motechembeddedengineering@gmail.com](mailto:motechembeddedengineering@gmail.com)

---

**MOTECH Embedded Engineering Ltd**  
Engineering Intelligence. Powering Tomorrow.
