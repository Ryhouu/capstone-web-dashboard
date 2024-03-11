
import { ChannelStatus, PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/app/src/utils/toast";

import { Alert, Box, Button, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from "react";

import * as React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { getContractExpiration, getContractRecipient, verifySignerIsSender } from "@/app/contracts/utils";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ethers } from "ethers";
import { AccountDataSchema } from "@/app/src/components/schema/AccountDataSchema";
import VerticalLinearStepper, { StepItem } from "@/app/src/components/share/VerticalLinearStepper";

const BasicInfoStepForm = ({
    isConnected,
    data,
    onChange,
    provider
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
    provider: ethers.BrowserProvider
}) => { 
    const [verifyContractStatus, setVerifyContractStatus] = React.useState<number>(0)
    const [verifyContractAlertMsg, setVerifyContractAlertMsg] = React.useState<string>('')

    const verifyContractAlertSeverity = React.useMemo(() => {
        switch (verifyContractStatus) {
            case 200: { 
                return 'success' 
            }
            case 400:
            case 404:
            case 405: {
                return 'warning'
            } 

            default: {
                return 'error'
            }
        }
    }, [verifyContractStatus])

    React.useEffect(() => {
        const fetchData = async () => {
            const contractAddress = data.contractAddress ? data.contractAddress : '';

            const verifyContractResult = await fetchWithToast(`/api/contract/verify-contract`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    contractAddress: contractAddress,
                })
            })

            if (verifyContractResult) {
                setVerifyContractStatus(verifyContractResult.status)
                const resJson = await verifyContractResult.json()
                setVerifyContractAlertMsg(resJson.message)
            }
            
            if (verifyContractResult.ok) {
                try {
                    const expirationUnix = await getContractExpiration({ provider, contractAddress });
                    if (expirationUnix) {
                        const expirationUnixInt = Number(expirationUnix) * 1000; 
                        onChange({ 
                            isVerified: true,
                            expirationDate: new Date(expirationUnixInt) 
                        });
                    }
                    console.log(data.expirationDate)
                } catch (error) {
                    console.error('Error fetching contract expiration:', error);
                }
            }
        };
    
        if (data.contractAddress) {
            fetchData();
        }
    }, [data.contractAddress]) 

    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >
    <Stack spacing={{ xs: 1, sm: 2 }} useFlexGap flexWrap="wrap">
        <TextField
            required
            id="standard-contract-address"
            label="Contract Address"
            variant="standard"
            value={data.contractAddress}
            onChange={(e) => { onChange({ contractAddress: e.target.value }) }}
        />

        {
            data.isVerified &&
            <Alert severity={verifyContractAlertSeverity} sx={{ width: "60ch"}}> 
                { verifyContractAlertMsg.toString() }
            </Alert>
        }
        {
            data.expirationDate &&
            <Alert severity="info" sx={{ width: "60ch"}}> 
                {"The contract will expire on: " +
                    data.expirationDate?.toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
                }
            </Alert>
        }

        <TextField
            required
            id="standard-amount"
            label="Amount"
            type="number"
            InputProps={{
                endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
            }}
            variant="standard"
            value={data.claimAmount}
            onChange={(e) => {
                const claimAmount = parseFloat(e.target.value)
                const claimAmountWei = claimAmount * 1000000000000000000
                onChange({ 
                    claimAmount: claimAmount,
                    claimAmountWei: claimAmountWei 
                })
            }}
        />

        <TextField
            required
            id="standard-multiline-signature"
            label="Signature"
            multiline
            maxRows={4}
            variant="standard"
            value={data.signature}
            onChange={(e) => { onChange({ signature: e.target.value }) }}
        />

        <TextField
            required
            id="standard-signer"
            label="Signer"
            variant="standard"
            value={data.senderAddress}
            onChange={(e) => { onChange({ senderAddress: e.target.value }) }}
        />
    </Stack>
    </Box>
    )
}

export default function VerifySignatureForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<AccountDataSchema>,
    onChange: (data: Partial<AccountDataSchema>) => void,
}) {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const [contractData, setContractData] = useState<Partial<PaymentChannelDataSchema>>({
        contractAddress: '',
        isDeployed: false,
        isVerified: false
    })
    const props = {
        isConnected: isConnected,
        data: contractData, 
        onChange: (data: Partial<PaymentChannelDataSchema>) => {
            setContractData({ ...contractData, ...data })
        }
    }

    const [isValidSignature, setIsValidSignature] = useState<boolean>()
    const [verifySignatureAlertMsg, setVerifySignatureAlertMsg] = React.useState<string>('')
    const [logSuccess, setLogSuccess] = useState(false);

    const handleSubmit = async() => {
        const contractAddress = contractData.contractAddress ? contractData.contractAddress : '';
        const signature = contractData.signature ? contractData.signature : '';
        const amount = contractData.claimAmountWei ? contractData.claimAmountWei : 0;
        const signer = contractData.senderAddress ? contractData.senderAddress : '';
        
        // Check if recipient is set to current user
        const contractRecipient = await getContractRecipient({ provider, contractAddress })
        if (contractRecipient) {
            console.log('contract recipient:', 
                contractRecipient.toLowerCase(), 
                data.account, 
                contractRecipient.toLowerCase() === data.account?.toLowerCase() 
            )
            if (contractRecipient.toLowerCase() !== data.account?.toLowerCase()) {
                setIsValidSignature(false)
                setVerifySignatureAlertMsg('Invalid Signature: This payment channel does not send to this account.')
                return
            }
        }

        // Check if signer is sender of contract address
        const signerIsSenderRes = await verifySignerIsSender({ provider, contractAddress, signer });
        if (!signerIsSenderRes) {
            console.log("signer is not sender")
            setIsValidSignature(false)
            setVerifySignatureAlertMsg('Invalid Signature: Signer does not own this payment channel.')
            return
        }

        // Checks if payment channel contains enough currency
        const balance = await provider.getBalance(contractAddress);
        if (balance < amount) {
            console.log("balance failure")
            setIsValidSignature(false)
            setVerifySignatureAlertMsg('Invalid Signature: This payment channel only contains ${Number(getBalance) / ethToWei} ETH and does not contain enough balance to send this amount.')
            return
        }

        const verifySignatureRes = await fetchWithToast(`/api/contract/verify-signature`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                contractAddress: contractAddress,
                amount: amount.toString(),
                signature: signature,
                signer: signer
            })
        })
            
        if (verifySignatureRes.ok) {
            const verifySignatureResData = await verifySignatureRes.json()
            if (verifySignatureResData && verifySignatureResData.isValidSignature) {
                setIsValidSignature(true)
                setVerifySignatureAlertMsg(`Signature is verified!`)

                const logRes = await fetchWithToast(`/api/log/verified-signatures`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        created_at: (new Date()).toISOString(),
                        account: data.account,
                        contract_address: contractData.contractAddress,
                        signer: signer,
                        amount: contractData.claimAmount,
                        signature: contractData.signature,
                        expiration: contractData.expirationDate ? contractData.expirationDate.toISOString() : null,
                        // status: ChannelStatus.Open, // TODO
                    })
                })
                if (logRes.status == 200) {
                    setLogSuccess(true)
                }
                else {
                    setLogSuccess(false)
                }

                // max payment
            }
            else {
                setIsValidSignature(false)
                setVerifySignatureAlertMsg('Invalid Signature: Signature does not match amount.')
            }
        }
    }

    const steps: StepItem[] = [
        {
          label: 'Basic Info',
          description: `Fill in the required information to verify the payment signature.`,
          children: <BasicInfoStepForm {...props} provider={provider} />,
          continueLabel: 'Verify',
          handleNext: handleSubmit
        },
    ];


    return (
        <Box>
            <VerticalLinearStepper
            steps={steps}
            completedChildren={
                <Box>
                {
                    contractData.expirationDate &&
                    <Alert severity="info" sx={{ width: "60ch"}}> 
                        {"The contract will expire on: " +
                            contractData.expirationDate?.toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
                        }
                    </Alert>
                }
                <Alert severity={isValidSignature ? "success" : "warning"} sx={{ width: "60ch"}}> 
                    { verifySignatureAlertMsg.toString() }
                </Alert>

                {
                    logSuccess &&
                    <Alert
                        severity="success"
                        variant="standard"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Your signature has been successfully logged.</Typography>
                        <Typography>You can check it at Account settings - My Signatures.</Typography>
                    </Alert>
                }
                </Box>
            }
            />
        </Box>
    )
}

