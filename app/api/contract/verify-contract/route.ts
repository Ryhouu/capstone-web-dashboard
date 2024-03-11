import { NextRequest, NextResponse } from 'next/server';
import abi from 'ethereumjs-abi';
// import ethers from 'ethers';
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import util from 'ethereumjs-util';
import Web3 from 'web3';
import { ethers } from 'ethers';


interface RequestBody {
    contractAddress: string
}

const alchemyUrl = 'https://eth-sepolia.g.alchemy.com/v2/N6jbViZYGzI-M8RUFCcFT3GirYmP6pid'
const provider = new ethers.JsonRpcProvider(alchemyUrl);

export async function POST (req: NextRequest) {
    try {
        const bodyJson: RequestBody = await req.json();
        console.log("POST - verify contract - Received request body:", bodyJson);
        // console.log("block number", provider.getBlockNumber())
        
        const getCode = await provider.getCode(bodyJson.contractAddress);
        const getBalance = await provider.getBalance(bodyJson.contractAddress);

        const emptyCode = '0x';
        const bytecodePath = path.resolve(process.cwd(), 'contracts', 'PaymentChannel.bytecode');
        const bytecode = fs.readFileSync(bytecodePath, 'utf8');
        
        if (getCode === emptyCode) {
            return NextResponse.json({ message: "Payment channel does not exist." }, { status: 404 })
        } else if (getBalance === BigInt(0)) {
            return NextResponse.json({ message: "Payment channel escrowed 0 ETH or closed." }, { status: 400 })
        } else if (getCode !== bytecode) {
            return NextResponse.json({ message: "Payment channel has been altered." }, { status: 405 })
        }
        return NextResponse.json({ message: "Payment channel verified!" }, { status: 200 })
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Internal server error." }, { status: 500 })
    }
}