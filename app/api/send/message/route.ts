// app/api/send/deploy/route.ts
import { NextRequest, NextResponse } from 'next/server';
import abi from 'ethereumjs-abi'

import Web3 from 'web3';
// const web3 = new Web3('http://localhost:3000')

interface RequestBody {
    contractAddress: string,
    amount: number
}

export async function POST (req: NextRequest) {
    try {
        const bodyJson: RequestBody = await req.json();
        console.log("POST - Received request body:", bodyJson);
        
        const paymentMessage = abi.soliditySHA3(
            ['address', 'uint256'],
            [bodyJson['contractAddress'], bodyJson['amount']]
        ).toString('hex')

        // const paymentMessage = Web3.utils.soliditySha3(
        //     {type: 'uint256', value: bodyJson['amount']},
        //     {type: 'address', value: bodyJson['contractAddress']}
        // )

        return NextResponse.json(
          {
            message: "Success",
            paymentMessage: paymentMessage
          }, 
          { status: 200 }
        )
    } catch (error) {
        console.error("Error in POST function:", error);
        return NextResponse.json({ message: "Internal Server Error : (" }, { status: 500 })
    }
}