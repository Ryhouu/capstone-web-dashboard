
import { ChannelStatus, PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/app/src/utils/toast";

import { Alert, Box, Button, CircularProgress, Divider, Fab, Paper, Tooltip, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState, useEffect } from "react";

import * as React from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import VerticalLinearStepper, { StepItem } from "@/app/src/components/share/VerticalLinearStepper";
import { AccountDataSchema } from "@/app/src/components/schema/AccountDataSchema";
import { ethers } from 'ethers'
import Link from '@mui/material/Link';
import { getContractExpiration } from "@/app/contracts/utils";
import CodeBlock from "@/app/src/components/share/CodeBlock";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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
            id="standard-recipient-address"
            label="Recipient Address"
            variant="standard"
            value={data.recipientAddress}
            onChange={(e) => onChange({ recipientAddress: e.target.value })}
        />

        <TextField
            required
            id="standard-escrow-amount"
            label="Escrow Amount"
            type="number"
            InputProps={{
                endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
            }}
            variant="standard"
            value={data.escrowAmount}
            onChange={(e) => {
                const escrowAmount = parseFloat(e.target.value)
                const escrowAmountWei = escrowAmount * 1000000000000000000
                onChange({ 
                    escrowAmount: escrowAmount,
                    escrowAmountWei: escrowAmountWei 
                })
            }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label="Expiration" 
                defaultValue={dayjs()}
                disablePast
                onChange={(e) => {
                    console.log(e?.toString())
                    if (e instanceof Date) {
                        onChange({ expirationDate: e });
                    }
                    else if (e instanceof dayjs) {
                        onChange({ expirationDate: e.toDate() });
                    }
                }}
            />
        </LocalizationProvider>
    </Stack>
    </Box>
    )
}

const ReviewStepForm = ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void,
}) => {
    console.log
    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >
    <Paper square elevation={3} sx={{ p: 3 }}>
    <Stack spacing={{ xs: 1, sm: 2 }} useFlexGap flexWrap="wrap">
        <TextField
            id="standard-recipient-address"
            label="Recipient Address"
            defaultValue={data.recipientAddress}
            InputProps={{
                readOnly: true,
            }}
            variant="standard"
            color="success" 
            focused
        />

        <TextField
            id="standard-escrow-amount"
            label="Escrow Amount"
            type="number"
            defaultValue={data.escrowAmount}
            InputProps={{
                endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                readOnly: true,
            }}
            variant="standard"
            color="success" 
            focused
        />

        <div>
            <Alert severity="info" sx={{ width: "60ch"}}> 
                {"The contract will expire on: " +
                    (data.expirationDate ? 
                        data.expirationDate.toLocaleString().replace(/T/, ' ').replace(/\..+/, '') 
                        : null
                    )
                }
            </Alert>
        </div>
    </Stack>
    </Paper> 
    </Box>
    )
}

export default function CreatePaymentChannelForm ({
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
        senderAddress: data.account,
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
    const [isDeploying, setIsDeploying] = useState(false);
    const [deploySuccess, setDeploySuccess] = useState(false);

    useEffect(() => {
        console.log("contractData.contractAddress:", contractData.contractAddress)
    }, [contractData.contractAddress]); 
    
    const handleSubmitDeploy = async() => {
        console.log("Handle Submit Deploy contract")
        setIsDeploying(true); 
        setDeploySuccess(false);

        const req = await fetchWithToast(`/api/send/deploy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                recipient: contractData.recipientAddress,
                expiration: contractData.expirationDate ? 
                Math.floor((contractData.expirationDate.getTime() - (new Date()).getTime()) / 1000) : 
                0 // convert into secs
            })
        })

        const res = await fetchWithToast(`/api/send/deploy`, {
            method: 'GET'
        })
        if (!req.ok || !res.ok) return

        const resData = await res.json()
        console.log(resData)

        const params = [{
            from: contractData.senderAddress,
            gas: Number(1500000).toString(16),
            gasLimit: Number(1500000).toString(16),
            value: Number(contractData.escrowAmountWei).toString(16),
            data: '0x' + resData['contractBytecode']
        }]

        const deploy = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params
        })
        console.log("deploy:", deploy)
        if (deploy) {
            provider.waitForTransaction(deploy).then(async (TxReceipt: ethers.TransactionReceipt | null) => {
                if (TxReceipt && TxReceipt.status) {
                    const contractAddress = TxReceipt.contractAddress ? TxReceipt.contractAddress : '';
                    
                    if (contractAddress) {
                        setContractData({ 
                            ...contractData, 
                            isDeployed: true, 
                            contractAddress: contractAddress 
                        })
                        console.log("Contract:", contractData)
                        setDeploySuccess(true); 

                        // TODO

                        const expirationUnix = await getContractExpiration({ provider, contractAddress });
                        // const logReq = await fetchWithToast(`/api/log/deploy-contract`, {
                        //     method: 'POST',
                        //     headers: {
                        //         'Content-Type': 'application/json',
                        //     },
                        //     body: JSON.stringify({ 
                        //         currentAccount: data.account,
                        //         contractAddress: TxReceipt['contractAddress'],
                        //         escrowAmount: contractData.escrowAmountWei, // toString?
                        //         recipient: contractData.recipientAddress,
                        //         expiration: expirationUnix.toString(),
                        //         signatures: [],
                        //         claimedTimeout: '0'
                        //     })
                        // })
                    } 
                }
                setIsDeploying(false);
            }).catch((error) => {
                console.log(error);
                setIsDeploying(false);
                setDeploySuccess(false);
            });
        }
        else {
            setIsDeploying(false);
        }
    }

    const [logSuccess, setLogSuccess] = useState(false);

    const handleLog = async() => {
        console.log("Logging Contract: ", contractData)

        const req = await fetchWithToast(`/api/log/payment-channels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                created_at: (new Date()).toISOString(),
                account: data.account,
                contract_address: contractData.contractAddress,
                escrow_amount: contractData.escrowAmount,
                recipient: contractData.recipientAddress,
                expiration: contractData.expirationDate ? contractData.expirationDate.toISOString() : null,
                max_payment: 0, // TODO
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

    React.useEffect(() => {
        if (deploySuccess) {
            handleLog()
        }
    }, [deploySuccess])
    

    const steps: StepItem[] = [
        {
          label: 'Basic Info',
          description: `Fill in the required information for your payment channel contract.`,
          children: <BasicInfoStepForm {...props} />,
          continueLabel: null,
          handleNext: () => {}
        },
        {
          label: 'Review & Deploy',
          description:
            'Review your payment channel contract.',
          children: <ReviewStepForm {...props} />,
          continueLabel: "Deploy",
          handleNext: handleSubmitDeploy
        }
    ];

    return (
        <Box>
            <VerticalLinearStepper 
            steps={steps} 
            completedChildren={
            <Box>
                {
                    isDeploying && 
                    <CircularProgress color="inherit" />
                }
                {
                    deploySuccess &&
                    <Box>
                        <Alert
                            severity="success"
                            sx={{ width: '100%' }}
                        >
                            <Typography>Payment channel successfully deployed.</Typography>
                            <CodeBlock
                                code={contractData.contractAddress ? contractData.contractAddress : ''} 
                                label='Contract Address'
                            />
                        </Alert>

                        <Divider />
                        
                        <Typography>View on Sepolia Explorer:</Typography>
                        <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            color: 'text.secondary',
                            '& svg': {
                                m: 1,
                            },
                        }}
                        >
                            <Button sx={{ flexGrow: 1 }} href={`https://sepolia.etherscan.io/tx/${contractData.transactionHash}`}>
                                View Transaction
                            </Button>
                            <Divider orientation="vertical" variant="middle" flexItem />
                            <Button sx={{ flexGrow: 1 }} href={`https://sepolia.etherscan.io/address/${contractData.contractAddress}`}>
                                View Contract
                            </Button>
                        </Box>
                    </Box>
                }
                {
                    !isDeploying && !deploySuccess &&
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Payment channel deployment failed.</Typography>
                        <Typography>Please try again.</Typography>
                    </Alert>
                }
                {
                    logSuccess &&
                    <Alert
                        severity="success"
                        variant="standard"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Your contract has been successfully logged.</Typography>
                        <Typography>You can check it at Account settings - My Payment Channels.</Typography>
                    </Alert>
                }
                {
                    !isDeploying && !logSuccess &&
                    <Alert
                        severity="error"
                        variant="standard"
                        sx={{ width: '100%' }}
                    >
                        <Typography>We cannot log your contract at this point.</Typography>
                        <Typography>Please report this issue.</Typography>
                    </Alert>
                }
            </Box>
            }
            />
        </Box>
    )
}

