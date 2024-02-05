
export interface PaymentChannelDataSchema {
    id: string,
    senderAddress: string,
    recipientAddress: string,
    amountSend: number,
    expiration: number, // secs
    contractAddress: string,
    signature: string,
    message: string,
    isVerified: boolean,
    amountClaim: number,
    closed: boolean
}