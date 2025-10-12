const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const CONFIG = {
  inputDir: path.join(__dirname, '../assets/characters-resized'), //  Changed to use resized frames
  outputDir: path.join(__dirname, '../assets/spritesheets'),
  characters: ['oracle', 'validator', 'guardian', 'daemon'],
  animations: ['idle', 'walking', 'interact'],
}

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true })
}

async function createSpriteSheet(character, animation) {
  const inputPath = path.join(CONFIG.inputDir, character, animation)

  if (!fs.existsSync(inputPath)) {
    console.warn(`  Skipping ${character}/${animation} - directory not found`)
    return
  }

  const files = fs
    .readdirSync(inputPath)
    .filter((f) => f.endsWith('.png'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0')
      const numB = parseInt(b.match(/\d+/)?.[0] || '0')
      return numA - numB
    })

  if (files.length === 0) {
    console.warn(` No PNG files found in ${character}/${animation}`)
    return
  }

  console.log(` Processing ${character}/${animation} (${files.length} frames)`)

  const firstImage = sharp(path.join(inputPath, files[0]))
  const metadata = await firstImage.metadata()
  const frameWidth = metadata.width
  const frameHeight = metadata.height

  const totalWidth = frameWidth * files.length
  const totalHeight = frameHeight

  const frames = []
  for (const file of files) {
    const frameBuffer = await sharp(path.join(inputPath, file)).toBuffer()
    frames.push(frameBuffer)
  }

  const compositeOps = frames.map((frame, index) => ({
    input: frame,
    left: index * frameWidth,
    top: 0,
  }))

  const outputPath = path.join(CONFIG.outputDir, `${character}-${animation}.png`)

  await sharp({
    create: {
      width: totalWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(compositeOps)
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  const fileStats = fs.statSync(outputPath)
  const fileSizeKB = (fileStats.size / 1024).toFixed(2)

  console.log(`Created: ${character}-${animation}.png`)
  console.log(`   Size: ${fileSizeKB}KB | Dimensions: ${totalWidth}x${totalHeight}px | Frames: ${files.length}`)

  return {
    character,
    animation,
    frames: files.length,
    frameWidth,
    frameHeight,
    totalWidth,
    totalHeight,
  }
}

async function generateAllSpriteSheets() {
  console.log('Starting sprite sheet generation...\n')

  const metadata = {}

  for (const character of CONFIG.characters) {
    metadata[character] = {}
    console.log(`\nGenerating sprite sheets for ${character}...`)

    for (const animation of CONFIG.animations) {
      try {
        const result = await createSpriteSheet(character, animation)
        if (result) {
          metadata[character][animation] = result
        }
      } catch (error) {
        console.error(`Error processing ${character}/${animation}:`, error.message)
      }
    }
  }

  const metadataPath = path.join(CONFIG.outputDir, 'sprite-metadata.json')
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  console.log(`\nMetadata saved to: sprite-metadata.json`)

  console.log('\n Sprite sheet generation complete!')
  console.log(`Output directory: ${CONFIG.outputDir}`)
}

generateAllSpriteSheets().catch(console.error)
