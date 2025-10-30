import { Path } from '@/types/path'
export const getActivePath = (paths: Path[]): Path | null => {
  return paths.find((path) => path.isActive) || null
}

// Get the next path in sequence
export const getNextPath = (paths: Path[], currentPathId: string): Path | null => {
  const currentIndex = paths.findIndex((path) => path.id === currentPathId)
  if (currentIndex === -1 || currentIndex === paths.length - 1) {
    return null // No next path
  }
  return paths[currentIndex + 1]
}

// Complete current path and unlock/activate next one
export const completePathAndUnlockNext = (paths: Path[], completedPathId: string): Path[] => {
  const currentIndex = paths.findIndex((path) => path.id === completedPathId)

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

export const UNDEAD_MESSAGES = [
  (playerName: string, title: string, summary: string, battleRelevance: string) =>
    `${playerName}, you have claimed a relic from the realm of the dead. It pulses with knowledge of ${title}.

${summary}

THE POWER IT GRANTS:
${battleRelevance}`,

  (playerName: string, title: string, summary: string, battleRelevance: string) =>
    `Welcome, ${playerName}. This ancient manuscript, written in blood and shadow, holds the essence of ${title}.

${summary}

WHAT YOU MUST MASTER:
${battleRelevance}`,

  (playerName: string, title: string, summary: string, battleRelevance: string) =>
    `Mortal ${playerName}, you have awakened a haunted codex. The restless dead have preserved their wisdom of ${title} within.

${summary}

YOUR PATH TO DARK MASTERY:
${battleRelevance}`,

  (playerName: string, title: string, summary: string, battleRelevance: string) =>
    `Heed this, ${playerName}. A spectral vision grants you insight into ${title}. The veil between worlds grows thin.

${summary}

YOUR ORDAINED DESTINY:
${battleRelevance}`,
  (playerName: string, title: string, summary: string, battleRelevance: string) =>
    `${playerName}, you have broken the seal on a cursed chronicle. Its pages decay as you read, revealing forbidden lore of ${title}.

${summary}

THE CURSE'S COMMAND:
${battleRelevance}`,
]
