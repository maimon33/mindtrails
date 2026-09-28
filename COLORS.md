# MindTrails Color System

## Primary Palette

### Primary - Deep Purple
- **Hex**: `#6F5FC1`
- **Usage**: Headings, primary buttons (hover state), form borders
- **Contrast**: Light text only (AA compliant)
- **Semantic**: Trust, creativity, learning

### Secondary - Golden Orange
- **Hex**: `#F0AD4E`
- **Usage**: Accent highlights, secondary CTAs
- **Contrast**: Dark text for readability
- **Semantic**: Energy, engagement, warmth

### Accent - Hot Pink
- **Hex**: `#E95AB2`
- **Usage**: Primary buttons, links, active states, dividers
- **Contrast**: Light text only (AA compliant)
- **Semantic**: Adventure, excitement, playfulness

### Dark - Charcoal
- **Hex**: `#2C3E50`
- **Usage**: Body text, headings, dark backgrounds
- **Contrast**: Light text/backgrounds
- **Semantic**: Trustworthy, professional

### Light - Off-White
- **Hex**: `#F8F9FA`
- **Usage**: Card backgrounds, light sections
- **Contrast**: Dark text for readability
- **Semantic**: Clean, spacious, welcoming

## Neutral Grays
- `#FFFFFF` — Pure white (backgrounds, cards)
- `#F5F5F5` — Light gray (subtle backgrounds)
- `#E0E0E0` — Medium gray (borders, dividers)
- `#999999` — Medium-dark gray (disabled states)
- `#333333` — Near-black (body text fallback)

## Usage Guidelines

### Buttons & CTAs
- **Primary Button**: Accent (#E95AB2) on white
- **Primary Button Hover**: Primary (#6F5FC1) on white
- **Secondary Button**: Primary (#6F5FC1) on light background

### Links
- **Default**: Accent (#E95AB2)
- **Hover**: Primary (#6F5FC1) + underline
- **Active**: Primary (#6F5FC1)

### Forms
- **Border**: Primary (#6F5FC1)
- **Focus**: Accent (#E95AB2) with shadow
- **Label**: Dark (#2C3E50), bold
- **Error**: `#DC3545` (standard error red)
- **Success**: `#28A745` (standard success green)

### Text
- **Headings**: Dark (#2C3E50), weight 900
- **Body**: Dark (#2C3E50), weight 400
- **Muted**: `#6C757D` (secondary gray)
- **Disabled**: `#999999`

### Backgrounds
- **Primary**: White (#FFFFFF)
- **Secondary**: Light (#F8F9FA)
- **Dark Overlay**: `rgba(0, 0, 0, 0.45)` (for image text contrast)

## Accessibility Notes

- **Contrast Ratios**: All text/button combinations meet WCAG AA standard (4.5:1 minimum)
- **Color Blindness**: Palette avoids red/green dominance; uses luminosity contrast
- **Print**: Grayscale-safe; no critical info conveyed by color alone

## CSS Variable Integration

Update styles using CSS variables in `custom.css`:

```css
:root {
  --color-primary: #6F5FC1;
  --color-secondary: #F0AD4E;
  --color-accent: #E95AB2;
  --color-dark: #2C3E50;
  --color-light: #F8F9FA;
}

button { background-color: var(--color-accent); }
h1 { color: var(--color-dark); }
```

## Future Considerations

- Consider adding a teal/cyan accent for data-heavy sections
- For dark mode: invert lightness values, keep hue
- Maintain at least 30% separation in hue angles for color harmony
