import Matter from 'matter-js'

const TRIGGER_DISTANCE = 80

export const CheckpointSystem = (entities: any, { time }: { time: any }) => {
  const character = entities.character?.body

  if (!character) return entities

  Object.keys(entities).forEach((key) => {
    if (key.startsWith('checkpoint_')) {
      const checkpoint = entities[key]

      if (checkpoint.isCompleted) return

      const dx = character.position.x - checkpoint.body.position.x
      const dy = character.position.y - checkpoint.body.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < TRIGGER_DISTANCE && !checkpoint.isTriggered) {
        checkpoint.isTriggered = true

        Matter.Body.setVelocity(character, { x: 0, y: character.velocity.y })

        if (entities.onCheckpointReached) {
          entities.onCheckpointReached(checkpoint.checkpointNumber, checkpoint.content)
        }
      }
    }
  })

  return entities
}

export const completeCheckpoint = (entities: any, checkpointNumber: number) => {
  const checkpointKey = `checkpoint_${checkpointNumber}`

  if (entities[checkpointKey]) {
    entities[checkpointKey].isCompleted = true
    entities[checkpointKey].isTriggered = false
  }

  return entities
}

export const createCheckpoint = (
  world: Matter.World,
  x: number,
  y: number,
  checkpointNumber: number,
  content: any,
  size: [number, number] = [60, 60],
) => {
  const checkpointBody = Matter.Bodies.rectangle(x, y, size[0], size[1], {
    label: `checkpoint_${checkpointNumber}`,
    isStatic: true,
    isSensor: true,
  })

  Matter.World.add(world, checkpointBody)

  return {
    body: checkpointBody,
    size,
    checkpointNumber,
    content,
    isCompleted: false,
    isTriggered: false,
    cameraOffset: { x: 0, y: 0 },
  }
}