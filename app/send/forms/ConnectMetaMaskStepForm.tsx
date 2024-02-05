import VerticalLayout from '@/app/src/components/layout/VerticalLayout';
import { PaymentChannelDataSchema } from '@/app/src/components/schema/PaymentChannelDataSchema';
import { Button, Typography } from '@mui/material'

export default function ConnectMetaMaskStepForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void
}) {
    const handleSubmit = async () => {
        let ethereum;
        if (typeof window !== 'undefined') {
            ethereum = window.ethereum;
            console.log("ethereum", ethereum);
        }

        if (!ethereum) {
            console.log('Ethereum object not found');
            return;
        }
        try {
            const accounts: string[] = await ethereum.request({ 
                method: "eth_requestAccounts" 
            });
            onChange({ senderAddress: accounts[0]})
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div style={{ paddingLeft: '10%', paddingTop: "30px" }}>
            <VerticalLayout>
                <Button variant="contained" onClick={ handleSubmit } className="defaultButton">
                    Connect to MetaMask
                </Button>
            </VerticalLayout>
        </div>
    )
}