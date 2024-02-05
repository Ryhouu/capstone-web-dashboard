import abi from 'ethereumjs-abi';
import util from 'ethereumjs-util';
import Web3 from 'web3';

export function prefixed (hashString: string) {
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
    signature: string
}) {
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

export function verifySignature(param: VerifySignatureSchema) {
    const hashString = Web3.utils.soliditySha3(
        {type: 'uint256', value: param.amount},
        {type: 'address', value: param.contractAddress}
    )
    var message = prefixed (hashString || '')
    var signer = recoverSigner({ message: message || '', signature: param.signature });
    return signer.toLowerCase() ==
        util.stripHexPrefix(param.signer).toLowerCase();
}
