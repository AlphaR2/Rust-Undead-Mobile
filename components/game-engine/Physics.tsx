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

  // Update camera to follow character and trigger re-render
  if (entities.camera && character && entities.setCameraOffset) {
    entities.camera.follow(character.position.x, character.position.y)
    
    // Update state to trigger re-render
    const newOffset = entities.camera.getOffset()
    entities.setCameraOffset(newOffset)
  }

  return entities
}