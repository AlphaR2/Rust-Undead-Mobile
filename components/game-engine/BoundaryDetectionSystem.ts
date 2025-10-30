// System to detect when character reaches the end of the world

const BOUNDARY_THRESHOLD = 100 // Distance from end to trigger callback

export const BoundaryDetectionSystem = (entities: any, { time }: { time: any }) => {
  const character = entities.character?.body
  const worldBounds = entities.worldBounds
  
  if (!character || !worldBounds) return entities

  const characterX = character.position.x
  const worldEnd = worldBounds.max
  const worldStart = worldBounds.min
  
  // Calculate distance from end
  const distanceFromEnd = worldEnd - characterX
  const distanceFromStart = characterX - worldStart

  // Debug log when near boundaries
  // if (distanceFromEnd < BOUNDARY_THRESHOLD * 2) {
  //   console.log(`📍 Distance from end: ${distanceFromEnd.toFixed(0)}px`)
  // }

  // Check if character reached the end
  if (distanceFromEnd < BOUNDARY_THRESHOLD && !entities.reachedEnd) {
    // console.log('🏁 Character reached the END of the world!')
    entities.reachedEnd = true
   
    
    // Trigger callback if provided
    if (entities.onReachEnd) {
      entities.onReachEnd()
    }
  }

  // Check if character went back from the end
  if (distanceFromEnd > BOUNDARY_THRESHOLD * 2 && entities.reachedEnd) {
    entities.reachedEnd = false
  }

  // Optional: Detect reaching start
  if (distanceFromStart < BOUNDARY_THRESHOLD && !entities.reachedStart) {
   
    entities.reachedStart = true
    
    if (entities.onReachStart) {
      entities.onReachStart()
    }
  }

  if (distanceFromStart > BOUNDARY_THRESHOLD * 2 && entities.reachedStart) {
    entities.reachedStart = false
  }

  return entities
}