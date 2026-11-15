# Kunjal Joshi — Personal AI Engineering Portfolio

A minimal, premium, dark portfolio website for **Kunjal Joshi**, Computer Science Engineer specializing in AI engineering, computer vision pipelines, and software systems development.

## Visual Identity & Design System

- **Background:** `#080808` (Almost-black)
- **Primary Text:** `#F5F5F5` (Off-white)
- **Accent:** `#F0A5C8` (Soft Baby Pink)
- **Secondary Text:** `#888888` (Muted Grey)
- **Borders:** `#1F1F1F` (Subtle Dark Grey)
- **Typography:**
  - Headings: `Space Grotesk`
  - Body Text: `Inter`
  - Technical / Terminal: `JetBrains Mono`

## Key Features

1. **Homepage Hero with Natural Pink Flame:**
   - Full-screen, almost entirely black hero section.
   - Seamless looping video (`/assets/pink-flame.mp4`) featuring real organic flame physics, color-graded to soft baby pink against pure black with subtle edge blending.
   - Clean, readable typography with "Building things that think." and direct CTAs.
   - Animated scroll indicator and reduced-motion fallback.

2. **Interactive Terminal Shell (`~` or Navigation Button):**
   - Fully functional dark terminal overlay.
   - Supports: `help`, `about`, `projects`, `skills`, `experience`, `lab`, `contact`, `resume`, `clear`, `open drawing-extractor`, `open floor-layout-tool`, `theme`, `whoami`, `exit`.
   - Features command history traversal (Up/Down arrows), tab completion, and Escape key to close.

3. **Curated Work & Detailed Case Studies:**
   - **AI Drawing Extraction Engine** (Python, OpenCV, EasyOCR, Gemini Vision API, React).
   - **Mini Floor Layout Tool** (React, Konva.js, Fabric.js, OpenCV exploration).
   - Structured case-study layout: Problem Statement, Solution Overview, Multi-tier Architecture, Technical Code Implementation, Solved Engineering Challenges, Demonstration Schematics, and Verified Results vs. Current Limitations.

4. **Technical Lab Journal:**
   - Minimal research journal with empirical benchmarks, hypotheses, and code snippets across Computer Vision, OCR & Document AI, and LLM Engineering.

5. **About & Contact:**
   - Engineering bio, categorized skillsets with proficiency badges, career trajectory, education, verified certifications, direct email copy, and resume download.

6. **Modular Character Companion Architecture:**
   - Built with an unobtrusive `CharacterSlot` component ready to accept custom chibi illustration assets once reference photos are provided, requiring zero redesign to the core layout.

## Tech Stack

- **Framework:** React 18 & Vite 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Motion & Transitions:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router v6

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
