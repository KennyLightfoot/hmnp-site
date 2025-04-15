const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("Running prebuild script to fix import issues...")

// Check if the package.json exists
if (!fs.existsSync("package.json")) {
  console.error("package.json not found!")
  process.exit(1)
}

// Read the package.json
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))

// Add the missing dependencies as devDependencies
// This is a temporary solution to make the build pass
const missingDeps = {
  "next-auth": "^4.24.5",
  "@vercel/kv": "^1.0.1",
  "react-schemaorg": "^2.0.0",
}

let depsAdded = false

if (!packageJson.devDependencies) {
  packageJson.devDependencies = {}
}

Object.entries(missingDeps).forEach(([dep, version]) => {
  if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies[dep]) {
    packageJson.devDependencies[dep] = version
    depsAdded = true
    console.log(`Added ${dep}@${version} to devDependencies`)
  }
})

// Write the updated package.json
if (depsAdded) {
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
  console.log("Updated package.json with missing dependencies")
}

console.log("Prebuild script completed successfully")
