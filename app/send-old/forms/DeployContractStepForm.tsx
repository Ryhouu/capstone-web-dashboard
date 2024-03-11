import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema"
import { useEffect, useState } from 'react'
import { Button, Typography } from "@mui/material"
import { fetchWithToast } from "@/app/src/utils/toast"

export default function DeployContractStepForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void
}) {

    const [isDeployed, setIsDeployed] = useState<boolean>(false)
    const [contractAddress, setContractAddress] = useState<string>('')

    const handleSubmit = async() => {
        console.log("Handle Submit")

        const req = await fetchWithToast(`/api/send/deploy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                recipient: data.recipientAddress,
                expiration: data.expiration ? (data.expiration * 3600) : 0 // convert into secs
            })
        })

        const res = await fetchWithToast(`/api/send/deploy`, {
            method: 'GET'
        })
        if (!req.ok || !res.ok) return

        const resData = await res.json()
        console.log(resData)

        const params = [{
            from: data.senderAddress,
            gas: Number(1500000).toString(16),
            gasLimit: Number(1500000).toString(16),
            value: Number(data.escrowAmount).toString(16),
            data: '0x' + resData['contractBytecode']
        }]

        const deploy = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params
        })
        if (deploy) {
            setIsDeployed(true)
        }
    }

    return (
        <div style={{ paddingLeft: '10%', paddingTop: "30px" }}>
            <Button variant="contained" onClick={handleSubmit} className="defaultButton">
            Deploy
            </Button>
            {isDeployed && (
                    <div style={{ width: '90%' }}>                        
                        <Typography variant="h5" component="h2" color="primary" className="title">
                        Contract Address:
                        </Typography>
                        <Typography variant="body2" color="secondary" className="infobox">
                        { contractAddress }
                        </Typography>
                    </div>
                )}
        </div>
    )
}