
export interface PaymentChannelDataSchema {
    id: string,
    senderAddress: string,
    recipientAddress: string,
    escrowAmount: number, // eth
    escrowAmountWei: number,
    expiration: number, // hrs
    contractAddress: string,
    signature: string,
    message: string,
    isVerified: boolean,
    isDeployed: boolean
    claimAmount: number,
    claimAmountWei: number,
    closed: boolean,
    expirationDate: Date,
    transactionHash: string,
    balance: number // eth
}

export enum ChannelStatus {
    Open = 'Open',
    Closed = 'Closed',
    Timeout = 'Timeout'
}

export interface PaymentChannelLogDataSchema {
    id: number,
    created_at: Date,
    account: string,
    contract_address: string,
    escrow_amount: number,
    recipient: string,
    expiration: Date,
    max_payment: number,
    status: ChannelStatus,
}