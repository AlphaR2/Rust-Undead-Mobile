import { Path } from "@/types/path"
export const getActivePath = (paths: Path[]): Path | null => {
  return paths.find(path => path.isActive) || null
}

// Get the next path in sequence
export const getNextPath = (paths: Path[], currentPathId: string): Path | null => {
  const currentIndex = paths.findIndex(path => path.id === currentPathId)
  if (currentIndex === -1 || currentIndex === paths.length - 1) {
    return null // No next path
  }
  return paths[currentIndex + 1]
}

// Complete current path and unlock/activate next one
export const completePathAndUnlockNext = (
  paths: Path[],
  completedPathId: string
): Path[] => {
  const currentIndex = paths.findIndex(path => path.id === completedPathId)
  
  if (currentIndex === -1) {
    console.error('Path not found:', completedPathId)
    return paths
  }

  return paths.map((path, index) => {
    if (index === currentIndex) {
      // Mark current path as completed and inactive
      return {
        ...path,
        isCompleted: true,
        isActive: false,
        progress: 100,
      }
    }
    
    if (index === currentIndex + 1) {
      // Unlock and activate next path
      return {
        ...path,
        isLocked: false,
        isActive: true,
      }
    }
    
    return path
  })
}
