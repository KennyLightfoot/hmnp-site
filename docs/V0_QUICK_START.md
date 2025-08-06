# v0.dev Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Git repository set up

### Step 1: Check Dependencies
```bash
pnpm v0:check-deps
```

This will verify that all required dependencies for v0.dev components are installed.

### Step 2: Generate Component with v0.dev
1. Visit [v0.dev](https://v0.dev)
2. Describe your component (e.g., "Create a contact form with name, email, and message fields")
3. Copy the generated code

### Step 3: Integrate Component
```bash
# Option 1: Using the integration script
pnpm v0:integrate ContactForm "$(cat generated-component.tsx)"

# Option 2: Manual integration
# 1. Create file: components/ui/ContactForm.tsx
# 2. Paste generated code
# 3. Update imports if needed
```

### Step 4: Test Component
```bash
# Start development server
pnpm dev

# Visit http://localhost:3000 to test your component
```

### Step 5: Commit Changes
```bash
git add components/ui/
git commit -m "feat: add v0.dev generated ContactForm component"
git push
```

## 🔧 Common Workflows

### Adding a New Component
```bash
# 1. Generate with v0.dev
# 2. Save code to temporary file
echo 'export function Button() { ... }' > temp-component.tsx

# 3. Integrate
pnpm v0:integrate Button "$(cat temp-component.tsx)"

# 4. Clean up
rm temp-component.tsx
```

### Validating Generated Code
```bash
# Validate before integration
pnpm v0:validate "$(cat generated-component.tsx)"
```

### Updating Existing Component
```bash
# 1. Generate new version with v0.dev
# 2. Backup existing component
cp components/ui/Button.tsx components/ui/Button.tsx.backup

# 3. Replace with new version
pnpm v0:integrate Button "$(cat new-version.tsx)"
```

## 📁 File Structure
```
components/
├── ui/                    # v0.dev components go here
│   ├── Button.tsx
│   ├── ContactForm.tsx
│   └── Button.example.tsx # Usage examples
└── ...                    # Other project components
```

## 🎯 Best Practices

### Component Naming
- Use PascalCase: `ContactForm`, `UserProfile`
- Be descriptive: `BookingCalendar` not `Calendar`
- Follow existing conventions

### Import Paths
- Use `@/components/ui/` for v0.dev components
- Use `@/lib/utils` for utility functions
- Keep imports consistent

### Styling
- Use Tailwind classes
- Follow project color scheme
- Maintain responsive design

### Testing
- Test on mobile and desktop
- Verify accessibility
- Check TypeScript errors

## 🐛 Troubleshooting

### Common Issues

**Import Errors**
```bash
# Check if utils file exists
ls lib/utils.ts

# Create if missing
touch lib/utils.ts
```

**Styling Issues**
```bash
# Check Tailwind config
cat tailwind.config.js

# Rebuild CSS
pnpm build
```

**TypeScript Errors**
```bash
# Run type check
pnpm type-check

# Fix issues manually
```

### Getting Help
1. Check the [full integration guide](./V0_INTEGRATION.md)
2. Review [Vercel v0 documentation](https://v0.dev)
3. Ask in team chat or create issue

## 📚 Next Steps

- Read the [full integration guide](./V0_INTEGRATION.md)
- Explore [v0.dev examples](https://v0.dev)
- Join [Vercel community discussions](https://community.vercel.com/c/v0/59)
- Contribute to this guide with your learnings 