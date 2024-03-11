
import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/app/src/utils/toast";

import { Alert, Box, Button, ButtonGroup, Checkbox, CircularProgress, Divider, Fab, FormControlLabel, FormGroup, Tooltip, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from "react";

import * as React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import VerticalLinearStepper, { StepItem } from "@/app/src/components/share/VerticalLinearStepper";
import GavelIcon from '@mui/icons-material/Gavel';
import CodeBlock from "@/app/src/components/share/CodeBlock";
import { AccountDataSchema } from "@/app/src/components/schema/AccountDataSchema";
import { ChannelStatus } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { convertETHtoWei, getContractExpiration } from "@/app/contracts/utils";
import { ethers } from 'ethers'

const BasicInfoStepForm = ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
}) => {
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
            onChange={(e) => onChange({ contractAddress: e.target.value })}
        />

        <TextField
            required
            id="standard-amount"
            label="Amount"
            type="number"
            InputProps={{
                endAdornment: <InputAdornment position="start">ETH</InputAdornment>,
            }}
            variant="standard"
            value={data.escrowAmount}
            onChange={(e) => {
                const escrowAmount = parseFloat(e.target.value)
                const escrowAmountWei = convertETHtoWei(escrowAmount)
                onChange({ 
                    escrowAmount: escrowAmount,
                    escrowAmountWei: escrowAmountWei 
                })
            }}
        />
    </Stack>
    </Box>
    )
}

const OptionsStepForm = ({
    isConnected,
    data,
    onChange,
    setLogSignature,
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
    setLogSignature: (value: boolean) => void,
}) => {
    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >
        <FormGroup>
        <FormControlLabel control={<Checkbox />} label="This is a final payment." />
        <FormControlLabel 
            control={<Checkbox defaultChecked onChange={(e) => {setLogSignature(e.target.checked)}} />} 
            label="Log this signature." />
        </FormGroup>
    </Box>
    )
}

export default function CreatePaymentSignatureForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<AccountDataSchema>,
    onChange: (data: Partial<AccountDataSchema>) => void,
}) {
    const [contractData, setContractData] = useState<Partial<PaymentChannelDataSchema>>({
        senderAddress: data.account,
        isVerified: false
    })
    const props = {
        isConnected: isConnected,
        data: contractData, 
        onChange: (data: Partial<PaymentChannelDataSchema>) => {
            setContractData({ ...contractData, ...data })
        }
    }
    const [isSigning, setIsSigning] = useState(false);
    const [signSuccess, setSignSuccess] = useState(false);
    const [logSignature, setLogSignature] = useState(true);
    const [logSuccess, setLogSuccess] = useState(false);

    const handleSubmit = async() => {
        setIsSigning(true); 
        setSignSuccess(false);
        console.log("Handle Submit - SignPayment, data: ", data)

        const res = await fetchWithToast(`/api/send/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                contractAddress: contractData.contractAddress,
                amount: contractData.escrowAmountWei?.toString()
            })
        })

        if (!res.ok) return

        const resData = await res.json()

        const signature = await window.ethereum.request({
            method: 'personal_sign',
            params: [
                '0x' + resData['paymentMessage'],
                contractData.senderAddress
            ]
        })

        if (signature) {
            const provider = new ethers.BrowserProvider(window.ethereum)
            const contractAddress = contractData.contractAddress ? contractData.contractAddress : ''
            const expirationUnix = await getContractExpiration({ provider, contractAddress });

            if (expirationUnix) {
                const expirationUnixInt = Number(expirationUnix) * 1000
                setContractData({ 
                    ...contractData,
                    signature: signature, 
                    message: resData['paymentMessage'],
                    expirationDate: new Date(expirationUnixInt)
                })
            }
            else {
                console.error("Fail to get expirationUnix.")
                setContractData({ 
                    ...contractData,
                    signature: signature, 
                    message: resData['paymentMessage'] 
                })
            }
            setIsSigning(false)
            setSignSuccess(true)
        }
        else {
            setIsSigning(false);
        }
    }

    const handleLog = async() => {
        if (logSignature && signSuccess) {
            console.log("Logging Contract: ", contractData)

            const req = await fetchWithToast(`/api/log/payment-signatures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    created_at: (new Date()).toISOString(),
                    account: data.account,
                    contractAddress: contractData.contractAddress,
                    signer: data.account,
                    amount: contractData.escrowAmount,
                    signature: contractData.signature,
                    expiration: contractData.expirationDate ? contractData.expirationDate.toISOString() : null,
                    status: ChannelStatus.Open, // TODO
                })
            })
            if (req.status == 200) {
                setLogSuccess(true)
            }
            else {
                setLogSuccess(false)
            }
        }
    }

    React.useEffect(() => {
        if (signSuccess && logSignature) {
            handleLog()
        }
    }, [logSignature, signSuccess])

    React.useEffect(() => {
        console.log("updated logSuccess", logSuccess)
    }, [logSuccess])

    const steps: StepItem[] = [
        {
          label: 'Basic Info',
          description: `Fill in the required fields to get your signature.`,
          children: <BasicInfoStepForm {...props} />,
          continueLabel: null,
          handleNext: () => {}
        },
        {
          label: 'Options',
          description: `Select Options.`,
          children: <OptionsStepForm {...props} setLogSignature={setLogSignature}/>,
          continueLabel: "Sign",
          handleNext: handleSubmit
        },
    ];

    return (
        <VerticalLinearStepper 
            steps={steps} 
            completedChildren={
                <Box>
                {
                    isSigning && 
                    <CircularProgress color="inherit" />
                }
                {
                    signSuccess &&
                    <Box sx={{
                        marginTop: "1ch"
                    }}>
                        <CodeBlock code={contractData.message ? contractData.message : ''} label={"Message"} />
                        <Divider sx={{ marginTop: "1ch" }} />
                        <CodeBlock code={contractData.signature ? contractData.signature : ''} label={"Signature"} />
                        <FormGroup>
                        </FormGroup>
                    </Box>
                }
 
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
                {
                    !isSigning && !logSuccess &&
                    <Alert
                        severity="error"
                        variant="standard"
                        sx={{ width: '100%' }}
                    >
                        <Typography>We cannot log your signature at this point.</Typography>
                        <Typography>Please report this issue.</Typography>
                    </Alert>
                }
                </Box>
            }
        />
    )
}




