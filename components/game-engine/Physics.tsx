import Matter from 'matter-js'

export const Physics = (entities: any, { time }: { time: any }) => {
  const engine = entities.physics.engine

  // Use fixed timestep for consistent physics
  Matter.Engine.update(engine, 16)

  // Lock character to ground - prevent ANY vertical movement
  const character = entities.character?.body
  const ground = entities.ground?.body

  if (character && ground) {
    // Calculate ground top position
    const groundTop = ground.position.y - 50 // 50 = half of ground height (100/2)

    // Calculate character half-height
    const characterHalfHeight = 64 // 128 / 2

    // Target Y position (character sitting on ground)
    const targetY = groundTop - characterHalfHeight

    // Force character position to ground level
    Matter.Body.setPosition(character, {
      x: character.position.x,
      y: targetY,
    })

    // Lock vertical velocity to 0
    Matter.Body.setVelocity(character, {
      x: character.velocity.x,
      y: 0,
    })
  }

  // Update camera to follow character
  if (entities.camera && character && entities.setCameraOffset) {
    entities.camera.follow(character.position.x, character.position.y)
    
    // Get the new camera offset
    const newOffset = entities.camera.getOffset()
    
    // Update the cameraOffset in all entities that need it
    if (entities.background) {
      entities.background.cameraOffset = newOffset
    }
    if (entities.character) {
      entities.character.cameraOffset = newOffset
    }
    if (entities.ground) {
      entities.ground.cameraOffset = newOffset
    }
    
    // Update all checkpoint offsets
    Object.keys(entities).forEach((key) => {
      if (key.startsWith('checkpoint_')) {
        entities[key].cameraOffset = newOffset
      }
    })
    
    // Trigger React re-render by updating state
    entities.setCameraOffset(newOffset)
  }

  return entities
}