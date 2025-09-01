import { PublicKey } from "@solana/web3.js";
import undeadIdl from "../idl/undead.json";

// Program ID for the Undead Warriors program on Devnet
export const PROGRAM_ID = new PublicKey(
  "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9"
);

export const DELEGATION_PROGRAM_ID = new PublicKey(
  "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
);

export const PROGRAM_IDL = undeadIdl;

export const authority = new PublicKey(
  "7gyjmugBPxx93NvdegiKz8JHeAaRYC8EbeFFuogWB9zX"
);
