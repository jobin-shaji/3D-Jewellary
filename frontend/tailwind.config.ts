import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'luxury': ['Playfair Display', 'serif'],
				'body': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
				'serif': ['Playfair Display', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Luxury jewelry color palette
				'gold': {
					50: 'hsl(48 40% 95%)',
					100: 'hsl(45 35% 88%)',
					200: 'hsl(42 40% 78%)',
					300: 'hsl(40 45% 68%)',
					400: 'hsl(38 50% 58%)',
					500: 'hsl(38 35% 45%)',
					600: 'hsl(38 35% 35%)',
					700: 'hsl(38 35% 25%)',
					800: 'hsl(35 30% 18%)',
					900: 'hsl(32 25% 12%)',
				},
				'pearl': {
					50: 'hsl(48 30% 98%)',
					100: 'hsl(48 25% 95%)',
					200: 'hsl(45 20% 90%)',
					300: 'hsl(42 18% 82%)',
					400: 'hsl(40 15% 72%)',
					500: 'hsl(38 12% 62%)',
					600: 'hsl(35 10% 52%)',
					700: 'hsl(32 8% 42%)',
					800: 'hsl(30 6% 32%)',
					900: 'hsl(28 5% 22%)',
				},
				'rose-gold': {
					50: 'hsl(15 35% 95%)',
					100: 'hsl(15 30% 88%)',
					200: 'hsl(15 25% 78%)',
					300: 'hsl(15 25% 68%)',
					400: 'hsl(15 25% 58%)',
					500: 'hsl(15 25% 48%)',
					600: 'hsl(15 25% 38%)',
					700: 'hsl(15 25% 28%)',
					800: 'hsl(15 20% 20%)',
					900: 'hsl(15 15% 12%)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'luxury': 'var(--shadow-luxury)',
				'gold': 'var(--shadow-gold)',
				'elegant': 'var(--shadow-elegant)',
			},
			backgroundImage: {
				'gradient-luxury': 'var(--gradient-luxury)',
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-pearl': 'var(--gradient-pearl)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'glow': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 2s linear infinite',
				'glow': 'glow 2s ease-in-out infinite alternate'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
