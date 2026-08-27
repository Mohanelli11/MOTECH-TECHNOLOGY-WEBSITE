## Pull Request: Extract and Commit Unzipped Project Files

### Description
This pull request merges the unzipped project files from `MOTECH TECHNOLOGY WEB.zip` into the main branch, establishing the foundation for the MOTECH Technology website.

### Changes Made
- **18 files added** across configuration, source code, and component layers
- Total additions: **+2,100** lines
- Includes complete React/Vite setup with TypeScript, Tailwind CSS, and Framer Motion

### Files Changed
**Configuration & Setup:**
- `index.html` - Entry HTML document
- `vite.config.ts` - Vite configuration
- `tsconfig.json` & `tsconfig.node.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts
- `postcss.config.js` - PostCSS configuration
- `tailwind.config.js` - Tailwind CSS theme configuration
- `.eslintrc.cjs` - ESLint rules
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation

**Source Code:**
- `src/index.tsx` - React entry point
- `src/App.tsx` - Main application component with routing
- `src/index.css` - Global styles
- `src/package.json` - Source dependencies

**Data & Components:**
- `src/data/site.ts` - Site configuration (company info, nav links, core areas, industries)
- `src/data/products.ts` - Product catalog (Smart Energy Meter, Smart Breathalyzer, Data Logger, ROAMfi)
- `src/components/CircuitBackground.tsx` - Decorative circuit board visualization
- `src/components/ParticleField.tsx` - Animated particle network component

### Tech Stack
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.2.0
- **Language:** TypeScript 5.5.4
- **Styling:** Tailwind CSS 3.4.17
- **Animations:** Framer Motion 11.5.4
- **Routing:** React Router DOM 6.26.2
- **Icons:** Lucide React 0.522.0

### Structure
The project is organized as a modern React SPA with:
- Home, Store, Product Detail, and Checkout pages
- Authentication system (Login, Register, Password Reset)
- User portal (Library, Orders, Licenses, Profile)
- Admin dashboard (Overview, Orders, Products, Documentation, Customers)
- Protected routes for authenticated and admin users

### Testing
- ESLint configured for code quality
- TypeScript strict mode enabled
- Build script ready: `npm run build`
- Dev server: `npm run dev`

### Merge Strategy
This branch is ready to merge into `main` and will serve as the foundation for further development of MOTECH's website.

### Checklist
- [x] Files extracted from ZIP
- [x] All configuration files present
- [x] TypeScript configuration validated
- [x] Dependencies specified
- [x] Ready for `npm install`

---
**Branch:** `unzip-project-files`  
**Base:** `main`  
**Commit:** a976cbe222930a08dd2977d77259a86932118eb9
