#\!/bin/bash
# Script to check if potentially unused files are actually imported anywhere
echo "=== CHECKING POTENTIALLY UNUSED FILES ==="
files=(
  "./app/api/bookings/custom-field-mapping.ts"
  "./app/global-error.tsx" 
  "./components/admin/BookingTable.tsx"
  "./components/admin/QuickActions.tsx"
  "./components/affiliate-signup-form.tsx"
  "./components/api-data-wrapper.tsx"
  "./components/form-error.tsx"
  "./components/form-success.tsx"
  "./components/newsletter-signup-form.tsx"
  "./components/request-call-form.tsx"
  "./components/service-skeleton.tsx"
  "./components/theme-provider.tsx"
  "./components/ui/drawer.tsx"
  "./hooks/use-api.ts"
  "./lib/api-client.ts"
  "./lib/api-fallback.ts"
  "./lib/api-response.ts"
  "./lib/config/vercel-env.ts"
  "./lib/database-optimization.ts"
  "./lib/db-optimization.ts"
  "./lib/email/templates/preparation-checklist.ts"
  "./lib/prisma-singleton.ts"
  "./lib/queue/example-usage.ts"
  "./lib/security/advanced-security.ts"
  "./lib/testing/test-automation.ts"
  "./lib/type-guards.ts"
  "./sentry.client.config.ts"
  "./sentry.server.config.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    basename=$(basename "$file"  < /dev/null |  sed "s/\.[^.]*$//")
    echo -e "\n--- Checking: $file ---"
    
    # Check for direct imports of the file
    echo "Direct imports:"
    rg -l "from.*$basename" --type typescript 2>/dev/null | grep -v "$file" || echo "  None found"
    
    # Check for relative imports  
    echo "Relative imports:"
    rg -l "from [\"']\\..*$basename" --type typescript 2>/dev/null | grep -v "$file" || echo "  None found"
    
    # For React components, also check JSX usage
    if [[ "$file" == *".tsx" ]]; then
      component_name=$(echo "$basename" | sed "s/-\([a-z]\)/\U\1/g" | sed "s/^\([a-z]\)/\U\1/")
      echo "JSX component usage:"
      rg -l "$component_name" --type typescript 2>/dev/null | grep -v "$file" || echo "  None found"
    fi
  else
    echo "$file - FILE NOT FOUND"
  fi
done
