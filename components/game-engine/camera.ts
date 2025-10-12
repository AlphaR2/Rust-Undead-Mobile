export class Camera {
  x: number = 0
  y: number = 0
  screenWidth: number
  screenHeight: number
  worldWidth: number

  constructor(screenWidth: number, screenHeight: number, worldWidth: number) {
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.worldWidth = worldWidth
  }

  follow(targetX: number, targetY: number) {
    // Center camera on target horizontally
    this.x = targetX - this.screenWidth / 2

    // Clamp camera to world bounds (don't show beyond edges)
    this.x = Math.max(0, Math.min(this.x, this.worldWidth - this.screenWidth))
    
    // Keep Y fixed for side-scroller
    this.y = 0
  }

  getOffset() {
    return { x: -this.x, y: -this.y }
  }
}