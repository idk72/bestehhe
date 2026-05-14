@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-zinc-950: #0A0A0B;
  --color-zinc-900: #0E0E10;
  --color-zinc-800: #121214;
}

@layer base {
  body {
    @apply bg-zinc-950 text-zinc-300 antialiased;
  }
}

.discord-embed-bar {
  width: 4px;
  background-color: #1e1f22;
  border-radius: 4px 0 0 4px;
}
