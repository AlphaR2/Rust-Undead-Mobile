import { KORA_CONFIG } from '@/config/kora'
import { KoraService } from '@/services/KoraService'
import { useMemo } from 'react'

let koraServiceInstance: KoraService | null = null
let cachedHealthCheck: { isHealthy: boolean; timestamp: number } | null = null
const CACHE_DURATION = 60000

interface KoraHook {
  service: KoraService
  checkHealth: () => Promise<boolean>
}

export const useKora = (): KoraHook => {
  const service = useMemo(() => {
    if (!koraServiceInstance) {
      koraServiceInstance = new KoraService(KORA_CONFIG)
    }
    return koraServiceInstance
  }, [])

  const checkHealth = async (): Promise<boolean> => {
    const now = Date.now()

    if (cachedHealthCheck && now - cachedHealthCheck.timestamp < CACHE_DURATION) {
      return cachedHealthCheck.isHealthy
    }

    const healthResult = await service.checkHealth()

    cachedHealthCheck = {
      isHealthy: healthResult.isHealthy,
      timestamp: now,
    }

    if (!healthResult.isHealthy) {
      console.warn('Kora health check failed:', healthResult.error)
    }

    return healthResult.isHealthy
  }

  return {
    service,
    checkHealth,
  }
}
