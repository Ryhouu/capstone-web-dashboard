import VerticalLayout from "@/app/src/components/layout/VerticalLayout"
import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema"
import { Typography } from "@mui/material"


export default function ConfirmContractStepForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void
}) {
    return (
        <div style={{ paddingLeft: '10%', paddingTop: "30px" }}>
            <VerticalLayout>
            
                <Typography variant="h5" component="h2" color="primary" className="title">
                    Contract Summary
                </Typography>

                <Typography variant="body1" color="secondary">
                    Sender:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data.senderAddress}
                </Typography>

                <Typography variant="body1" color="secondary">
                    Recipient: 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data.recipientAddress}
                </Typography>

                <Typography variant="body1" color="secondary">
                    Amount: 
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data.amountSend}
                </Typography>

                <Typography variant="body1" color="secondary">
                    Expiration:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {data.expiration}
                </Typography>
            
            </VerticalLayout>
        </div>
    )
}