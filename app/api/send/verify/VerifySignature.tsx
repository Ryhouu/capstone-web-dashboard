import util from 'ethereumjs-util';
import Web3 from 'web3';

export function prefixed (hashString: string | undefined) {
    // return abi.soliditySHA3(
    //     ["string", "bytes32"],
    //     ["\x19Ethereum Signed Message:\n32", hash]
    // );
    return Web3.utils.soliditySha3(
        {type: 'string', value: "\x19Ethereum Signed Message:\n32"},
        {type: 'bytes32', value: hashString}
    )
}

export function recoverSigner ({
    message, 
    signature,
}: {
    message: string,
    signature: string,
}) {

    try {
        const split = util.fromRpcSig(signature);
        // ... rest of the code
    } catch (error) {
        console.error("Error processing the signature:", signature, error);
        // Handle the error or rethrow
    }
    const split = util.fromRpcSig(signature);
    const messageBuffer = Buffer.from(message, 'hex');
    const publicKey = util.ecrecover(messageBuffer, split.v, split.r, split.s);
    const signer = util.pubToAddress(publicKey).toString("hex");
    return signer;
}

export interface VerifySignatureSchema {
    contractAddress: string,
    amount: number
    signature: string,
    signer: string
}

export function verifySignature(params: VerifySignatureSchema) {
    console.log("Params: ", params)
    const hashString = Web3.utils.soliditySha3(
        {type: 'uint256', value: params.amount},
        {type: 'address', value: params.contractAddress}
    )
    if (typeof(hashString) === undefined) {
        console.error("Invalid hash string.")
    }
    var message = prefixed (hashString)
    console.log("message: ", message)

    var signer = recoverSigner({ message: message || '', signature: params.signature });
    return signer.toLowerCase() ==
        util.stripHexPrefix(params.signer).toLowerCase();
}
