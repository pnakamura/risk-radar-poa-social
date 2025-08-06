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
				'risk-excellent': 'hsl(var(--risk-excellent))',
				'risk-excellent-bg': 'hsl(var(--risk-excellent-bg))',
				'risk-excellent-border': 'hsl(var(--risk-excellent-border))',
				'risk-good': 'hsl(var(--risk-good))',
				'risk-good-bg': 'hsl(var(--risk-good-bg))',
				'risk-good-border': 'hsl(var(--risk-good-border))',
				'risk-warning': 'hsl(var(--risk-warning))',
				'risk-warning-bg': 'hsl(var(--risk-warning-bg))',
				'risk-warning-border': 'hsl(var(--risk-warning-border))',
				'risk-critical': 'hsl(var(--risk-critical))',
				'risk-critical-bg': 'hsl(var(--risk-critical-bg))',
				'risk-critical-border': 'hsl(var(--risk-critical-border))',
				'category-strategic': 'hsl(var(--category-strategic))',
				'category-strategic-bg': 'hsl(var(--category-strategic-bg))',
				'category-operational': 'hsl(var(--category-operational))',
				'category-operational-bg': 'hsl(var(--category-operational-bg))',
				'category-financial': 'hsl(var(--category-financial))',
				'category-financial-bg': 'hsl(var(--category-financial-bg))',
				'category-compliance': 'hsl(var(--category-compliance))',
				'category-compliance-bg': 'hsl(var(--category-compliance-bg))',
				'category-regulatory': 'hsl(var(--category-regulatory))',
				'category-regulatory-bg': 'hsl(var(--category-regulatory-bg))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
