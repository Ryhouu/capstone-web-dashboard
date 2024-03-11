import { NextRequest, NextResponse } from 'next/server';
import abi from 'ethereumjs-abi';
// import ethers from 'ethers';
import fs from 'fs';
import path from 'path';
import solc from 'solc';
import util from 'ethereumjs-util';
import Web3 from 'web3';
import { VerifiedSignatureLogDataSchema } from "@/app/src/components/schema/PaymentSignatureDataSchema";
import { supabase } from '@/app/src/utils/supabaseClient'

export async function POST (req: NextRequest) {
    try {
        const bodyJson: VerifiedSignatureLogDataSchema = await req.json();
        console.log("POST: verified-signatures - Received request body:", bodyJson);

        const { data, error } = await supabase.from('verified_signatures')
          .insert(bodyJson)

        if (error) {
          console.log("insert error", error)
          return NextResponse.json({ message: "Bad Request" }, { status: 400 })
        }
      
        console.log("success")
        return NextResponse.json({ message: "Success" }, { status: 200 })
      } catch (error) {
        console.error("Error in POST function:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET (req: NextRequest) {
  try {
    console.log("GET - Received request");
    const url = new URL(req.url);
    const account = url.searchParams.get('account');

    const { data: verified_signatures } = await supabase.from("verified_signatures")
      .select('*')
      .eq('account', account);

    return NextResponse.json(
      {
        message: "Success",
        verifiedSignatureData: verified_signatures
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in GET function:", error);
    return NextResponse.json({ message: "Method Not Allowed : (" }, { status: 405 })
  }
}