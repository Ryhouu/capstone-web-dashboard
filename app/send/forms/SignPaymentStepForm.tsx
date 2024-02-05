import FormFieldSimpleLayout from "@/app/src/components/layout/FormFieldSimpleLayout";
import LengthLimitTextField from "@/app/src/components/layout/LengthLimitTextField";
import VerticalLayout from "@/app/src/components/layout/VerticalLayout";
import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { Button, Typography } from "@mui/material";
import { useState } from "react";
import '@/app/src/styles/sendpayment.css'; 
import HorizontalLayout from "@/app/src/components/layout/HorizontalLayout";
import { fetchWithToast } from "@/app/src/utils/toast";

const fields = {
    contractAddress: {
        label: 'Contract Address',
        description: 'The address of the contract just deployed.',
    },
    amount: {
      label: 'Amount',
      description: 'Amount (Wei) you want to send.',
    }
}

export default function SignPaymentStepForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void
}) {

    const [isSigned, setIsSigned] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')

    const handleSubmit = async() => {
        console.log("Handle Submit - SignPayment, data: ", data)

        const req = await fetchWithToast(`/api/send/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                contractAddress: data.contractAddress,
                amount: data.amountSend
            })
        })

        const res = await fetchWithToast(`/api/send/message`, {
            method: 'GET'
        })
        if (!req.ok || !res.ok) return

        const resData = await res.json()
        console.log(resData)

        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [
                resData['paymentMessage'],
                data.senderAddress
            ]
        })

        if (signature) {
            onChange({ signature: signature })
            setMessage(resData['paymentMessage'])
            setIsSigned(true)
            console.log("Sign Payment", data)
        }
    }

    return (
        <div style={{ paddingLeft: '10%', paddingTop: "30px", width: '100%' }}>
            <VerticalLayout>
                {/* <HorizontalLayout> */}
                    <FormFieldSimpleLayout {...fields.contractAddress} required>
                        <LengthLimitTextField
                            minLength={3}
                            maxLength={80}
                            name="contract_address"
                            variant="outlined"
                            fullWidth
                            value={data.contractAddress}
                            onChange={(e) => onChange({ contractAddress: e.target.value })}
                        />
                    </FormFieldSimpleLayout>
                    <FormFieldSimpleLayout {...fields.amount} required>
                        <LengthLimitTextField
                            minLength={3}
                            maxLength={80}
                            name="amount"
                            variant="outlined"
                            fullWidth
                            value={data.amountSend}
                            onChange={(e) => onChange({ amountSend: parseInt(e.target.value) })}
                        />
                    </FormFieldSimpleLayout>
                {/* </HorizontalLayout> */}
                

                <Button variant="contained" onClick={handleSubmit} className="defaultButton"> 
                Sign 
                </Button>

                {isSigned && (
                    <div style={{ width: '90%' }}>
                        {/* <Typography variant="h5" component="h2" color="primary" className="title">
                        Message
                        </Typography>
                        <Typography variant="body2" color="secondary" className="infobox">
                        { message }
                        </Typography> */}
                        
                        <Typography variant="h5" component="h2" color="primary" className="title">
                        Signature
                        </Typography>
                        <Typography variant="body2" color="secondary" className="infobox">
                        { data.signature }
                        </Typography>
                    </div>
                )}

            </VerticalLayout>
        </div>
    )
}