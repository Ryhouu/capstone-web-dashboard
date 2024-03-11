import { ChannelStatus } from "./PaymentChannelDataSchema";

export interface PaymentSignatureLogDataSchema {
    id: number,
    created_at: Date,
    account: string,
    contractAddress: string,
    signer: string,
    amount: number,
    signature: string,
    expiration: Date,
    status: ChannelStatus,
}

export interface VerifiedSignatureLogDataSchema {
    id: number,
    created_at: Date,
    account: string,
    contract_address: string,
    signer: string,
    amount: number,
    signature: string,
    expiration: Date,
}