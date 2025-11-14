export interface KoraConfig {
  endpoint: string;
  apiKey: string;
}

export interface PayerSignerResponse {
  signer_address: string;
  payment_address: string;
}

export interface BlockhashResponse {
  blockhash: string;
  last_valid_block_height: number;
}

export interface SignTransactionResponse {
  signed_transaction: string;
}

export interface SignAndSendTransactionResponse {
  signature: string;
}
