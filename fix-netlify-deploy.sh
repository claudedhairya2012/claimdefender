#!/bin/bash

echo "🔥 FIXING NETLIFY 404 ROUTING ISSUE..."

# Stop on any error
set -e

# Clear all caches
echo "🧹 Clearing build caches..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache
rm -rf .netlify
npm cache clean --force

# Reinstall dependencies with latest Netlify plugin
echo "📦 Reinstalling dependencies..."
npm install
npm install --save-dev @netlify/plugin-nextjs@latest

# Verify Next.js config is correct
echo "🔍 Auditing Next.js configuration..."
if grep -q 'output.*export' next.config.* 2>/dev/null; then
    echo "❌ CRITICAL: Found 'output: export' in Next.js config - this MUST be removed!"
    echo "Edit your next.config file and remove the 'output: export' line"
    exit 1
fi

# Test build locally
echo "🏗️ Testing build locally..."
npm run build

# Verify .next directory exists (not out/)
if [ ! -d ".next" ]; then
    echo "❌ CRITICAL: .next directory not found after build!"
    echo "Check your Next.js configuration for static export settings"
    exit 1
fi

if [ -d "out" ]; then
    echo "❌ WARNING: 'out' directory detected - this suggests static export mode"
    echo "Remove any 'output: export' from your Next.js config"
    rm -rf out
fi

# Stage critical configuration files
echo "📝 Staging configuration files..."
git add netlify.toml
git add next.config.*
git add package.json

# Verify netlify.toml exists and is staged
if [ ! -f "netlify.toml" ]; then
    echo "❌ CRITICAL: netlify.toml not found!"
    echo "Create the netlify.toml file with the configuration provided"
    exit 1
fi

# Commit with force flag
echo "💾 Committing configuration fix..."
git commit -m "fix: resolve Netlify 404 routing for Next.js App Router

- Configure @netlify/plugin-nextjs for serverless functions
- Remove static export conflicts from Next.js config
- Add proper redirect rules for SPA routing
- Force clean build with correct publish directory

Fixes: Next.js App Router 404 on page refresh"

# Force push to trigger clean deploy
echo "🚀 Force pushing to trigger clean Netlify deploy..."
git push origin main --force-with-lease

echo "✅ DEPLOYMENT INITIATED"
echo ""
echo "🔗 Monitor deployment: https://app.netlify.com/sites/YOUR_SITE/deploys"
echo ""
echo "⚠️  CRITICAL VERIFICATION STEPS:"
echo "1. Ensure Netlify build uses '.next' as publish directory (not 'out')"
echo "2. Verify @netlify/plugin-nextjs is active in build logs"
echo "3. Confirm serverless functions are created for API routes"
echo "4. Test dynamic routes after deployment completes"
echo ""
echo "If still failing, check Netlify build logs for:"
echo "- 'Using @netlify/plugin-nextjs' message"
echo "- Serverless function creation logs"
echo "- No 'Static export detected' warnings"
