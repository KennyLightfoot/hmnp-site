# HMNP Color Style Guide

## Semantic Color Mapping

| Semantic Name | Purpose | Light Mode | Dark Mode |
|---------------|---------|------------|-----------|
| `primary` | Main brand color, call-to-action elements | Auburn (#7D3C3A) | Auburn (#9D4C4A) |
| `secondary` | Supporting color, backgrounds, borders | Cadet Gray (#91A3B0) | Cadet Gray (#7A8A95) |
| `accent` | Headings, important text | Oxford Blue (#14213D) | Light Gray (#E5E5E5) |
| `muted` | Less important text, subtle elements | Gray (#6B7280) | Light Gray (#D1D5DB) |
| `background` | Page background | White (#FFFFFF) | Dark Blue (#0F172A) |
| `card` | Card backgrounds | White (#FFFFFF) | Dark Blue (#1E293B) |
| `border` | Borders, dividers | Light Gray (#E5E5E5) | Dark Gray (#2D3748) |
| `destructive` | Error messages, warnings | Red (#EF4444) | Red (#F87171) |

## Component Color Usage

### Form Components

#### BookingForm & ContactForm
- Container: `border-secondary/20 bg-card`
- Headings: `text-accent`
- Success message: `border-primary/20 bg-primary/5`
- Success icon: `text-primary`
- Error message: `bg-destructive/10 border-destructive text-destructive`
- Calendar icon: `text-primary`
- Radio buttons: `data-[state=checked]:border-primary data-[state=checked]:text-primary`

#### AddressAutocomplete
- Label: `text-accent`
- Input: `bg-background`

### UI Components

#### LoadingSpinner
- Spinner: `border-primary border-t-transparent`

#### NotificationBanner
- Variants:
  - Default: `bg-background border-border`
  - Primary: `bg-primary/10 border-primary/20`
  - Secondary: `bg-secondary/10 border-secondary/20`
  - Accent: `bg-accent/10 border-accent/20`
- CTA link: `text-primary hover:text-primary/80`
- Close button: `text-foreground hover:bg-muted`

#### PageHeader
- Title: `text-accent`
- Description: `text-muted-foreground`

#### SocialLinks
- Icons:
  - Default: `bg-primary/10 hover:bg-primary/20 text-primary`
  - Outline: `border-primary/20 hover:border-primary/40 text-primary`

#### ReviewStars
- Filled stars: `text-primary fill-primary`
- Half stars: `text-primary fill-primary/50`
- Empty stars: `text-muted-foreground fill-none`
- Rating text: `text-accent`

#### FeatureList
- Check icon: `text-primary`
- Text: `text-foreground`

## Dark Mode Considerations

When implementing dark mode:
- Ensure sufficient contrast between text and background colors
- Adjust opacity values for overlays and hover states
- Test interactive elements for visibility and usability
- Consider reducing intensity of bright colors

## Implementation Notes

1. Always use semantic color classes instead of direct color names:
   - ✅ `text-primary`, `bg-secondary/10`
   - ❌ `text-auburn`, `bg-cadetGray/10`

2. For opacity variants, use the format:
   - `{color-name}/{opacity}`
   - Example: `bg-primary/10` (10% opacity)

3. For hover/focus states, use:
   - `hover:bg-primary/20`
   - `focus:ring-primary/30`

4. For gradients, use semantic colors:
   - `from-primary to-secondary`

5. For shadows, consider using:
   - `shadow-primary/20`

## Accessibility Guidelines

- Maintain a minimum contrast ratio of 4.5:1 for normal text
- Use 3:1 minimum contrast for large text (18pt+)
- Don't rely on color alone to convey information
- Test with screen readers and keyboard navigation

## Component-Specific Guidelines

### Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Secondary: `bg-secondary text-secondary-foreground hover:bg-secondary/90`
- Outline: `border-primary text-primary hover:bg-primary/10`
- Ghost: `text-accent hover:bg-accent/10`

### Cards
- Standard: `bg-card border-border`
- Highlighted: `bg-primary/5 border-primary/20`

### Alerts
- Info: `bg-blue-50 border-blue-200 text-blue-800`
- Success: `bg-green-50 border-green-200 text-green-800`
- Warning: `bg-yellow-50 border-yellow-200 text-yellow-800`
- Error: `bg-destructive/10 border-destructive text-destructive`

