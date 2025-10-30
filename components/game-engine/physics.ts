import Matter from 'matter-js'

export const Physics = (entities: any, { time }: { time: any }) => {
  const engine = entities.physics.engine

  Matter.Engine.update(engine, time.delta)

  const character = entities.character?.body
  const ground = entities.ground?.body

  if (character && ground) {
    const groundTop = ground.position.y - 50
    const characterHalfHeight = 64
    const targetY = groundTop - characterHalfHeight

    Matter.Body.setPosition(character, {
      x: character.position.x,
      y: targetY,
    })

    Matter.Body.setVelocity(character, {
      x: character.velocity.x,
      y: 0,
    })
  }

  if (character && Math.abs(character.velocity.x) > 0.1) {
    const direction = character.velocity.x > 0 ? 1 : -1
    Matter.Body.setVelocity(character, {
      x: direction * 20,
      y: 0,
    })
  }

  if (entities.camera && character) {
    entities.camera.follow(character.position.x, character.position.y)

    const newOffset = entities.camera.getOffset()

    if (entities.setCameraOffsetRef) {
      entities.setCameraOffsetRef(newOffset)
    }

    if (entities.setCameraOffset) {
      entities.setCameraOffset(newOffset)
    }
  }

  return entities
}