import Matter from 'matter-js'

// Proximity threshold for triggering checkpoint (in pixels)
const TRIGGER_DISTANCE = 80

export const CheckpointSystem = (entities: any, { time }: { time: any }) => {
  const character = entities.character?.body
  
  if (!character) return entities

  // Check all checkpoints
  Object.keys(entities).forEach((key) => {
    if (key.startsWith('checkpoint_')) {
      const checkpoint = entities[key]
      
      // Skip if already completed
      if (checkpoint.isCompleted) return

      // Calculate distance between character and checkpoint
      const dx = character.position.x - checkpoint.body.position.x
      const dy = character.position.y - checkpoint.body.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // Check if character is close enough to trigger checkpoint
      if (distance < TRIGGER_DISTANCE && !checkpoint.isTriggered) {
        // Mark as triggered to prevent multiple triggers
        checkpoint.isTriggered = true
        
        // Stop character movement
        Matter.Body.setVelocity(character, { x: 0, y: character.velocity.y })
        
        // Trigger modal callback
        if (entities.onCheckpointReached) {
          entities.onCheckpointReached(checkpoint.checkpointNumber, checkpoint.content)
        }
      }
    }
  })

  return entities
}

// Helper function to complete a checkpoint
export const completeCheckpoint = (entities: any, checkpointNumber: number) => {
  const checkpointKey = `checkpoint_${checkpointNumber}`
  
  if (entities[checkpointKey]) {
    entities[checkpointKey].isCompleted = true
    entities[checkpointKey].isTriggered = false // Reset for potential re-trigger
  }
  
  return entities
}

// Helper to create checkpoint bodies
export const createCheckpoint = (
  world: Matter.World,
  x: number,
  y: number,
  checkpointNumber: number,
  content: any,
  size: [number, number] = [60, 60]
) => {
  const checkpointBody = Matter.Bodies.rectangle(x, y, size[0], size[1], {
    label: `checkpoint_${checkpointNumber}`,
    isStatic: true,
    isSensor: true, // Makes it non-collidable but detectable
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