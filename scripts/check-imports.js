const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Packages that are causing issues
const problematicPackages = [
  "next-auth/react",
  "@vercel/kv",
  "next-auth",
  "next-auth/providers/google",
  "react-schemaorg",
]

// Function to recursively find all files in a directory
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const filePath = path.join(dir, file)
    if (fs.statSync(filePath).isDirectory()) {
      // Skip node_modules and .next directories
      if (file !== "node_modules" && file !== ".next") {
        fileList = getAllFiles(filePath, fileList)
      }
    } else {
      // Only check JavaScript and TypeScript files
      if (/\.(js|jsx|ts|tsx)$/.test(file)) {
        fileList.push(filePath)
      }
    }
  })

  return fileList
}

// Function to check if a file imports any of the problematic packages
function checkFileForImports(filePath) {
  const content = fs.readFileSync(filePath, "utf8")
  const foundImports = []

  problematicPackages.forEach((pkg) => {
    // Check for import statements
    if (
      content.includes(`from '${pkg}'`) ||
      content.includes(`from "${pkg}"`) ||
      content.includes(`import '${pkg}'`) ||
      content.includes(`import "${pkg}"`)
    ) {
      foundImports.push({ package: pkg, file: filePath })
    }
  })

  return foundImports
}

// Main function
function main() {
  console.log("Checking for problematic imports...")

  const allFiles = getAllFiles(".")
  let allFoundImports = []

  allFiles.forEach((file) => {
    const foundImports = checkFileForImports(file)
    allFoundImports = [...allFoundImports, ...foundImports]
  })

  if (allFoundImports.length === 0) {
    console.log("No problematic imports found.")
    return
  }

  console.log("Found problematic imports:")
  allFoundImports.forEach(({ package, file }) => {
    console.log(`- ${package} in ${file}`)
  })

  console.log("\nYou need to either:")
  console.log("1. Install the missing packages:")
  console.log(`   npm install ${[...new Set(allFoundImports.map((i) => i.package))].join(" ")}`)
  console.log("2. Or remove the imports from the files listed above")
}

main()
