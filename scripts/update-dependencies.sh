#!/bin/bash
# Dependency Update Script
# Run with: bash scripts/update-dependencies.sh [phase]

set -e

PHASE=${1:-"help"}

function print_header() {
    echo ""
    echo "================================"
    echo "$1"
    echo "================================"
    echo ""
}

function run_tests() {
    echo "Running tests..."
    pnpm type-check
    pnpm lint
    pnpm test:ci
    echo "✓ Tests passed"
}

case $PHASE in
    "phase1"|"security")
        print_header "Phase 1: Critical Security Updates"
        echo "Updating Next.js to fix critical RCE and DoS vulnerabilities..."
        pnpm update next@15.5.8

        echo ""
        echo "Updating google-auth-library to fix jws vulnerability..."
        pnpm update google-auth-library

        echo ""
        echo "Running tests after security updates..."
        run_tests

        echo ""
        echo "✓ Phase 1 complete!"
        echo "⚠️  Review changes and test in staging before deploying"
        ;;

    "phase2"|"dedupe")
        print_header "Phase 2: Remove Duplicate Dependencies"
        echo "⚠️  WARNING: This phase requires manual migration first!"
        echo ""
        echo "Before running this, you must:"
        echo "1. Migrate all moment.js usage to date-fns"
        echo "2. Migrate all luxon usage to date-fns"
        echo "3. Test thoroughly"
        echo ""
        read -p "Have you completed the migration? (yes/no): " confirm

        if [ "$confirm" = "yes" ]; then
            echo "Removing duplicate date libraries..."
            pnpm remove moment moment-timezone luxon @types/luxon
            echo "✓ Removed moment and luxon"

            run_tests
            echo "✓ Phase 2 complete!"
        else
            echo "Aborting. Please complete migration first."
            exit 1
        fi
        ;;

    "phase3"|"cleanup")
        print_header "Phase 3: Clean Up Unnecessary Dependencies"

        echo "Checking if body-parser is used..."
        if ! grep -r "body-parser" --include="*.{ts,tsx,js,jsx}" --exclude-dir=node_modules . >/dev/null 2>&1; then
            echo "body-parser not found in code, removing..."
            pnpm remove body-parser 2>/dev/null || echo "body-parser already removed"
        else
            echo "⚠️  body-parser is still used in code, skipping removal"
        fi

        echo ""
        echo "Checking if gtag is used..."
        if ! grep -r "gtag" --include="*.{ts,tsx,js,jsx}" --exclude-dir=node_modules . >/dev/null 2>&1; then
            echo "gtag not found in code, checking removal..."
            # Don't auto-remove, just warn
            echo "ℹ️  Consider removing 'gtag' if using @next/third-parties"
        fi

        run_tests
        echo "✓ Phase 3 complete!"
        ;;

    "phase4"|"safe")
        print_header "Phase 4: Safe Minor/Patch Updates"
        echo "Updating minor and patch versions (should be safe)..."

        pnpm update @hookform/resolvers@latest
        pnpm update lucide-react@latest
        pnpm update @tailwindcss/forms@latest
        pnpm update @tailwindcss/typography@latest
        pnpm update @supabase/ssr@latest
        pnpm update @lhci/cli@latest

        echo ""
        echo "Updating Radix UI components to latest patch versions..."
        pnpm update "@radix-ui/*@latest"

        run_tests
        echo "✓ Phase 4 complete!"
        ;;

    "phase5"|"major")
        print_header "Phase 5: Major Version Updates (One at a Time)"
        echo "⚠️  These updates may have breaking changes!"
        echo ""
        echo "Select which package to update:"
        echo "1) Prisma (6.x -> 7.x)"
        echo "2) Sentry (9.x -> 10.x)"
        echo "3) Stripe packages (18.x -> 20.x, 3.x -> 5.x, 7.x -> 8.x)"
        echo "4) Sanity (4.x -> 5.x)"
        echo "5) Resend (2.x -> 6.x)"
        echo "6) Nodemailer (6.x -> 7.x)"
        echo "7) All of the above (risky!)"
        echo ""
        read -p "Enter choice (1-7) or 'q' to quit: " choice

        case $choice in
            1)
                echo "Updating Prisma..."
                pnpm update @prisma/client@latest prisma@latest
                pnpm prisma generate
                run_tests
                ;;
            2)
                echo "Updating Sentry..."
                pnpm update @sentry/nextjs@latest
                run_tests
                ;;
            3)
                echo "Updating Stripe packages..."
                pnpm update stripe@latest @stripe/stripe-js@latest @stripe/react-stripe-js@latest
                run_tests
                ;;
            4)
                echo "Updating Sanity..."
                pnpm update sanity@latest next-sanity@latest @sanity/client@latest @sanity/vision@latest @sanity/visual-editing@latest
                run_tests
                ;;
            5)
                echo "Updating Resend..."
                pnpm update resend@latest
                run_tests
                ;;
            6)
                echo "Updating Nodemailer..."
                pnpm update nodemailer@latest
                run_tests
                ;;
            7)
                echo "⚠️  Updating all major versions..."
                echo "This is risky and may cause multiple breaking changes!"
                read -p "Are you sure? (yes/no): " confirm
                if [ "$confirm" = "yes" ]; then
                    pnpm update @prisma/client@latest prisma@latest
                    pnpm prisma generate
                    pnpm update @sentry/nextjs@latest
                    pnpm update stripe@latest @stripe/stripe-js@latest @stripe/react-stripe-js@latest
                    pnpm update sanity@latest next-sanity@latest @sanity/client@latest
                    pnpm update resend@latest nodemailer@latest
                    run_tests
                else
                    echo "Aborting."
                    exit 1
                fi
                ;;
            q|Q)
                echo "Exiting."
                exit 0
                ;;
            *)
                echo "Invalid choice"
                exit 1
                ;;
        esac

        echo "✓ Phase 5 update complete!"
        ;;

    "audit")
        print_header "Running Security Audit"
        pnpm audit
        echo ""
        echo "For detailed JSON output:"
        echo "  pnpm audit --json"
        ;;

    "outdated")
        print_header "Checking Outdated Packages"
        pnpm outdated
        ;;

    "check-types")
        print_header "Checking @types/node Duplication"
        echo "Current @types/node versions:"
        grep -A1 "\"@types/node\"" package.json || echo "Not found"
        echo ""
        echo "ℹ️  Should only be in devDependencies"
        ;;

    "help"|*)
        echo "Dependency Update Script"
        echo ""
        echo "Usage: bash scripts/update-dependencies.sh [phase]"
        echo ""
        echo "Phases:"
        echo "  phase1 | security  - Critical security updates (Next.js, jws)"
        echo "  phase2 | dedupe    - Remove duplicate date libraries (requires migration)"
        echo "  phase3 | cleanup   - Remove unnecessary dependencies"
        echo "  phase4 | safe      - Safe minor/patch updates"
        echo "  phase5 | major     - Major version updates (interactive)"
        echo ""
        echo "Utility Commands:"
        echo "  audit              - Run security audit"
        echo "  outdated           - List outdated packages"
        echo "  check-types        - Check for @types/node duplication"
        echo ""
        echo "Example:"
        echo "  bash scripts/update-dependencies.sh phase1"
        echo ""
        echo "⚠️  Always test in staging before deploying to production!"
        ;;
esac
