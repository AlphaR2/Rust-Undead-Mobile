import Matter from 'matter-js';
import { Dimensions } from 'react-native';

const Physics = (entities, { time }) => {
  const engine = entities.physics.engine;
  
  // Update the physics engine
  Matter.Engine.update(engine, time.delta);

  // Get current screen dimensions (handles orientation changes)
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Keep character within screen bounds
  const character = entities.character.body;
  const characterWidth = entities.character.size[0];

  // Prevent character from going off-screen (left and right)
  if (character.position.x < characterWidth / 2) {
    Matter.Body.setPosition(character, { 
      x: characterWidth / 2, 
      y: character.position.y 
    });
    Matter.Body.setVelocity(character, { x: 0, y: character.velocity.y });
  }
  if (character.position.x > screenWidth - characterWidth / 2) {
    Matter.Body.setPosition(character, { 
      x: screenWidth - characterWidth / 2, 
      y: character.position.y 
    });
    Matter.Body.setVelocity(character, { x: 0, y: character.velocity.y });
  }

  return entities;
};

export { Physics };
