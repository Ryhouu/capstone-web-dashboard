import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/src/utils/supabaseClient'
import { PaymentChannelDataSchema, PaymentChannelLogDataSchema } from '@/app/src/components/schema/PaymentChannelDataSchema';

export async function POST (req: NextRequest) {
    try {
        const bodyJson: PaymentChannelLogDataSchema = await req.json();
        console.log("POST: payment-signatures - Received request body:", bodyJson);

        const { data, error } = await supabase.from('payment_channels')
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

    const { data: payment_channels } = await supabase.from("payment_channels")
      .select('*')
      .eq('account', account);

    return NextResponse.json(
      {
        message: "Success",
        paymentChannelData: payment_channels
      }, 
      { status: 200 }
    )
  } catch (error) {
    console.error("Error in GET function:", error);
    return NextResponse.json({ message: "Method Not Allowed : (" }, { status: 405 })
  }
}