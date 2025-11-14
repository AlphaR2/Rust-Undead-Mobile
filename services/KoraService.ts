import {
  BlockhashResponse,
  KoraConfig,
  PayerSignerResponse,
  SignAndSendTransactionResponse,
  SignTransactionResponse,
} from '@/types/kora'

import { Transaction } from '@solana/web3.js'

export class KoraService {
  private config: KoraConfig
  private requestId = 1

  constructor(config: KoraConfig) {
    this.config = config
  }

  private async call<T>(method: string, params?: any): Promise<T> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: this.requestId++,
      }),
    })

    if (!response.ok) {
      throw new Error(`Kora HTTP error: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`Kora RPC error: ${data.error.message}`)
    }

    return data.result
  }

  async getPayerSigner(): Promise<PayerSignerResponse> {
    return this.call<PayerSignerResponse>('getPayerSigner')
  }

  async getBlockhash(): Promise<BlockhashResponse> {
    return this.call<BlockhashResponse>('getBlockhash')
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    const result = await this.call<SignTransactionResponse>('signTransaction', {
      transaction: serialized.toString('base64'),
    })

    return Transaction.from(Buffer.from(result.signed_transaction, 'base64'))
  }

  async signAndSendTransaction(transaction: Transaction): Promise<string> {
    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    })

    const result = await this.call<SignAndSendTransactionResponse>('signAndSendTransaction', {
      transaction: serialized.toString('base64'),
    })

    return result.signature
  }

  async checkHealth(): Promise<{ isHealthy: boolean; error?: string }> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'getConfig',
          id: 0,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        return {
          isHealthy: false,
          error: `Kora returned status ${response.status}`,
        }
      }

      const data = await response.json()

      if (data.error) {
        return {
          isHealthy: false,
          error: data.error.message || 'Kora RPC error',
        }
      }

      return { isHealthy: true }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { isHealthy: false, error: 'Kora connection timeout' }
      }
      return {
        isHealthy: false,
        error: error.message || 'Kora connection failed',
      }
    }
  }
}
