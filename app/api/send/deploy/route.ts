// app/api/send/deploy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import abi from 'ethereumjs-abi';
// import ethers from 'ethers';
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import util from 'ethereumjs-util';
import Web3 from 'web3';

const web3 = new Web3('http://localhost:3000')

let contractAbi: any;
let contractBytecode: any;

interface RequestBody {
  recipient: string,
  expiration: number
}

export async function POST (req: NextRequest) {
    try {
      const bodyJson: RequestBody = await req.json();
      console.log("POST - Received request body:", bodyJson);
    
      const encodedParameters = web3.eth.abi.encodeParameters(
        ['address', 'int'],
        [bodyJson['recipient'], bodyJson['expiration']]
      ).slice(2);

      const contractPath = path.resolve(process.cwd(), 'contracts', 'PaymentChannel.sol');
      const source = fs.readFileSync(contractPath, 'utf8');
  
      const toCompile = {
        language: 'Solidity',
        sources: { 'PaymentChannel.sol': { content: source } },
        settings: { outputSelection: { '*': { '*': ['*'] } } }
      };
      const output = JSON.parse(solc.compile(JSON.stringify(toCompile)));
  
      const contract = 'PaymentChannel';
      contractAbi = output.contracts['PaymentChannel.sol'][contract].abi;
      contractBytecode = output.contracts['PaymentChannel.sol'][contract].evm.bytecode.object + encodedParameters;  

      console.log("success")
      return NextResponse.json({ message: "Success" }, { status: 200 })
    } catch (error) {
      console.error("Error in POST function:", error);
      return NextResponse.json({ message: "Internal Server Error : (" }, { status: 500 })
    }
}

export async function GET (req: NextRequest) {
    try {
      console.log("GET - Received request");

      return NextResponse.json(
        {
          message: "Success",
          contractAbi: contractAbi,
          contractBytecode: contractBytecode 
        }, 
        { status: 200 }
      )
    } catch (error) {
      console.error("Error in GET function:", error);
      return NextResponse.json({ message: "Method Not Allowed : (" }, { status: 405 })
    }
}