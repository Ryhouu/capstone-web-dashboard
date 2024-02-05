import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/app/src/utils/toast";

import { Button, Typography } from "@mui/material";
import { useState } from "react";

export default function VerifySignatureStepForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
}) {

    const [isValidSignature, setIsValidSignature] = useState<boolean>()

    const handleSubmit = async() => {
        console.log("Handle Submit - VerifySignature, data: ", data)
        
        const req = await fetchWithToast(`/api/send/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                contractAddress: data.contractAddress,
                amount: data.amountSend,
                signature: data.signature,
                signer: data.senderAddress
            })
        })

        const res = await fetchWithToast(`/api/send/verify`, {
            method: 'GET'
        })
        if (!req.ok || !res.ok) return

        const resData = await res.json()
        setIsValidSignature(resData.isValidSignature)
    }

    return (
        <div style={{ paddingLeft: '10%', paddingTop: "20px", width: '100%' }}>
            {data.signature && (
                <div style={{ width: '90%' }}>
                    <Typography variant="h5" component="h2" color="primary" className="title">
                    Signature
                    </Typography>
                    <Typography variant="body2" color="secondary" className="infobox">
                    { data.signature }
                    </Typography>

                    <Button variant="contained" onClick={handleSubmit}> 
                    Verify 
                    </Button>
                    {isValidSignature && (
                        <Typography variant="h5" component="h2" color="primary" className="title">
                        Verified
                        </Typography>
                    )}
                    {!isValidSignature && (
                        <Typography variant="h5" component="h2" color="error" className="title">
                        Not verified
                        </Typography>
                    )}
                </div>

            )}
        </div>

    )
}