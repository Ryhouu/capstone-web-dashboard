// app/api/send/deploy/route.ts
import { NextRequest, NextResponse } from 'next/server';

import Web3 from 'web3';
// const web3 = new Web3('http://localhost:3000')

interface RequestBody {
    contractAddress: string,
    amount: number
}

let paymentMessage: any;

export async function POST (req: NextRequest) {
    try {
        const bodyJson: RequestBody = await req.json();
        console.log("POST - Received request body:", bodyJson);
        
        // paymentMessage = abi.soliditySHA3(
        //     ['address', 'uint256'],
        //     [bodyJson['contractAddress'], bodyJson['amount']]
        // ).toString('hex')

        paymentMessage = Web3.utils.soliditySha3(
            {type: 'uint256', value: bodyJson['amount']},
            {type: 'address', value: bodyJson['contractAddress']}
        )

        console.log(paymentMessage)

        return NextResponse.json(
            { message: "Success" }, 
            { status: 201 }
        )
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
          paymentMessage: paymentMessage
        }, 
        { status: 200 }
      )
    } catch (error) {
      console.error("Error in GET function:", error);
      return NextResponse.json({ message: "Method Not Allowed : (" }, { status: 405 })
    }
}