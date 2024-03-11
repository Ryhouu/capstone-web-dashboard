// app/api/send/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifySignature, VerifySignatureSchema } from './VerifySignature';

let isValidSignature: boolean = false;

export async function POST (req: NextRequest) {
    try {
        const bodyJson: VerifySignatureSchema = await req.json();
        console.log("POST - Received request body:", bodyJson);

        isValidSignature = verifySignature(bodyJson)

        return NextResponse.json(
            { 
              message: "Success", 
              isValidSignature: isValidSignature
            }, 
            { status: 201 }
        )
    } catch (error) {
        console.error("Error in POST function:", error);
        return NextResponse.json({ message: "Internal Server Error : (" }, { status: 500 })
    }
}