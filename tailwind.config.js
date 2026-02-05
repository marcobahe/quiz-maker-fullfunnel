/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // New Design System Colors
      colors: {
        // Core brand colors
        primary: "#6366f1",
        accent: "#F43F5E",
        gold: "#F59E0B",
        
        // Brand palette
        "brand-blue": "#3b82f6",
        "brand-pink": "#ec4899",
        "brand-orange": "#f97316",
        "brand-purple": "#8b5cf6",
        "brand-teal": "#14b8a6",
        
        // Backgrounds
        "background-light": "#f0f4ff",
        "background-dark": "#0a0c1b",
        "surface-light": "#ffffff",
        "surface-dark": "#1e293b",
        
        // Legacy (keep for backward compatibility)
        sidebar: '#1a1f36',
        'sidebar-hover': '#252b45',
        'accent-hover': '#e11d48',
        success: '#10b981',
        'success-hover': '#059669',
        
        // Space theme (for mystery box)
        "space-blue": "#2b45ff",
        "deep-space": "#151931",
      },
      
      // Typography
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body: ["Spline Sans", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      
      // Border Radius - More rounded, modern feel
      borderRadius: {
        DEFAULT: "1rem",
        sm: "0.75rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "2.5rem",
        "3xl": "3rem",
        "4xl": "3.5rem",
      },
      
      // Box Shadows - 3D tactile feel
      boxShadow: {
        'tactile': '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
        'tactile-sm': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'button-3d': '0 6px 0 #2563EB, 0 10px 20px -5px rgba(59, 130, 246, 0.5)',
        'button-3d-pressed': '0 2px 0 #2563EB',
        'glow-primary': '0 0 30px rgba(99, 102, 241, 0.4)',
        'glow-gold': '0 0 40px rgba(245, 158, 11, 0.5)',
        'card-elevated': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner-soft': 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.05)',
      },
      
      // Animations
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0) rotate(-1deg)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0) rotate(2deg)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0) rotate(-3deg)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0) rotate(3deg)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      
      // Background images for patterns
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh-gradient': 'radial-gradient(at 0% 0%, var(--tw-gradient-from) 0, transparent 50%), radial-gradient(at 100% 0%, var(--tw-gradient-to) 0, transparent 50%)',
      },
    },
  },
  plugins: [],
}
