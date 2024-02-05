// app/api/send/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, VerifySignatureSchema } from './VerifySignature';

let isValidSignature: boolean = false;

export async function POST (req: NextRequest) {
    try {
        const bodyJson: VerifySignatureSchema = await req.json();
        console.log("POST - Received request body:", bodyJson);

        isValidSignature = verifySignature(bodyJson)

        console.log(bodyJson)

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
          isValidSignature: isValidSignature
        }, 
        { status: 200 }
      )
    } catch (error) {
      console.error("Error in GET function:", error);
      return NextResponse.json({ message: "Method Not Allowed : (" }, { status: 405 })
    }
}