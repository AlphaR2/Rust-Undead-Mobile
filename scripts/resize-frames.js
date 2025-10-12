const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const CONFIG = {
  inputDir: path.join(__dirname, '../assets/characters'),
  outputDir: path.join(__dirname, '../assets/characters-resized'),
  characters: ['oracle', 'validator', 'guardian', 'daemon'],
  animations: ['idle', 'walking', 'interact'],
  targetSize: 128, // Resize to 128x128
}

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true })
}

async function resizeFrames(character, animation) {
  const inputPath = path.join(CONFIG.inputDir, character, animation)
  const outputPath = path.join(CONFIG.outputDir, character, animation)

  // Check if directory exists
  if (!fs.existsSync(inputPath)) {
    console.warn(`  Skipping ${character}/${animation} - directory not found`)
    return
  }

  // Create output directory
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true })
  }

  // Get all PNG files
  const files = fs
    .readdirSync(inputPath)
    .filter((f) => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.match(/\d+/)?.[0] || '0')
      return numA - numB
    })

  if (files.length === 0) {
    console.warn(`  No PNG files found in ${character}/${animation}`)
    return
  }

  console.log(` Resizing ${character}/${animation} (${files.length} frames)...`)

  // Resize each frame
  for (const file of files) {
    const inputFile = path.join(inputPath, file)
    const outputFile = path.join(outputPath, file)

    await sharp(inputFile)
      .resize(CONFIG.targetSize, CONFIG.targetSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outputFile)
  }

  console.log(` Resized ${files.length} frames for ${character}/${animation}`)
}

async function resizeAllFrames() {
  console.log(' Starting frame resizing...\n')
  console.log(` Target size: ${CONFIG.targetSize}x${CONFIG.targetSize}px\n`)

  for (const character of CONFIG.characters) {
    console.log(`\n Processing ${character}...`)
    for (const animation of CONFIG.animations) {
      try {
        await resizeFrames(character, animation)
      } catch (error) {
        console.error(` Error resizing ${character}/${animation}:`, error.message)
      }
    }
  }

  console.log('\n\n Frame resizing complete!')
  console.log(`Resized frames saved to: ${CONFIG.outputDir}`)
  console.log('\n Next step: Run generate-spritesheets.js')
}

// Run the script
resizeAllFrames().catch(console.error)
