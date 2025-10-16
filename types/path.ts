export interface Path {
  id: string
  title: string
  subtitle: string
  image: any
  isLocked: boolean
  isActive: boolean
  isCompleted: boolean
  isSvg: boolean
  progress: number // track percentage completion (0-100)
}