## Packages
framer-motion | Essential for retro animations, glitch effects, and smooth transitions
react-confetti | For celebration effects when URL is shortened successfully

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["'Press Start 2P'", "cursive"],
  mono: ["'Space Mono'", "monospace"],
}

API Integration:
- POST /api/shorten for creating short links
- GET /api/resolve/:code for resolving links
- Handles 404/410 for expired or missing links
