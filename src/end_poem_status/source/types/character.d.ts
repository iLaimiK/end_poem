export interface Character {
  name?: string
  roles: string[]
  status?: string[]
  theme?: string
  focus?: number
  affection?: number
  healingProgress?: number
  factor?: string
  dependency?: number
  recognition?: number
  memeCorruption?: number
  corruption?: number
  task?: string
  items?: Record<string, {
    type: string
    desc: string
    quantity?: number
  }>
  abilities?: Record<string, string> | string[]
  appearance?: {
    外貌?: Record<string, string>
    服饰?: Record<string, string>
  }
  posture?: string
  souls?: Record<string, {
    desc: string
    soulAbilities: string[]
  }>
  visible?: boolean
}

// 次要角色接口
export interface SideCharacter {
  name?: string
  identity: string
  trustLevel: number
  appearance: string
  posture: string
  items: Record<string, {
    type: string
    desc: string
    quantity?: number
  }>
  abilities: Record<string, string>
}