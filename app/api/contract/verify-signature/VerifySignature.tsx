import util from 'ethereumjs-util';
import { fromRpcSig, stripHexPrefix, ecrecover, pubToAddress } from 'ethereumjs-util';
import Web3 from 'web3';
import abi from 'ethereumjs-abi'

export function prefixed (hashString: any) {
    return abi.soliditySHA3(
        ["string", "bytes32"],
        ["\x19Ethereum Signed Message:\n32", hashString]
    );
    // return Web3.utils.soliditySha3(
    //     {type: 'string', value: "\x19Ethereum Signed Message:\n32"},
    //     {type: 'bytes32', value: hashString}
    // )
}

export function recoverSigner ({
    messageHash, 
    signature,
}: {
    messageHash: any,
    signature: string,
}) {
    let signer = '';
    try {
        const split = fromRpcSig(signature);
        // const messageBuffer = Buffer.from(messageHash.slice(2), 'hex');
        const publicKey = ecrecover(messageHash, split.v, split.r, split.s);
        signer = pubToAddress(publicKey).toString("hex");
    } catch (error) {
        console.error("Error processing the signature:", signature, error);
    }
    return signer;
}

export interface VerifySignatureSchema {
    contractAddress: string,
    amount: string,
    signature: string,
    signer: string
}

export function verifySignature(params: VerifySignatureSchema) {
    console.log("Params: ", params)
    // const hashString = Web3.utils.soliditySha3(
    //     {type: 'uint256', value: params.amount},
    //     {type: 'address', value: params.contractAddress}
    // )
    const hashString = abi.soliditySHA3(
        ['address', 'uint256'],
        [params.contractAddress, params.amount]
    )
    if (typeof(hashString) === undefined) {
        console.error("Invalid hash string.")
    }
    var messageHash = prefixed (hashString)
    console.log("message: ", messageHash)

    var signer = recoverSigner({ messageHash: messageHash, signature: params.signature });
    const res = signer.toLowerCase() === stripHexPrefix(params.signer).toLowerCase()
    console.log("verifySignature result: ", res)
    return res
}
