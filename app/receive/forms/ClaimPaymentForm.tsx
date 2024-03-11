
import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/app/src/utils/toast";

import { Alert, Box, Button, CircularProgress, MenuItem, Paper, Select, SelectChangeEvent, TableCell, Typography } from "@mui/material";
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
import { PaymentChannelABI } from "@/app/contracts/PaymentChannel-abi";
import { VerifiedSignatureLogDataSchema } from "@/app/src/components/schema/PaymentSignatureDataSchema";

const InstructionStepForm = () => { 
    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >

    </Box>
    )
}

const SelectSignatureStepForm = ({
    data,
    selectedIndex,
    setSelectedIndex
}: {
    data: VerifiedSignatureLogDataSchema[],
    selectedIndex: number | null,
    setSelectedIndex: (value: number) => void
}) => { 
    const handleChange = (event: SelectChangeEvent) => {
        setSelectedIndex(parseInt(event.target.value));
    };

    return (
    <Box 
        component="form"
        sx={{
        '& .MuiTextField-root': { m: 1, width: '60ch' },
        }}
        noValidate
    >
    <FormControl variant="filled" sx={{ m: 1, minWidth: '60ch' }}>
        <InputLabel id="demo-simple-select-filled-label">Signature to claim</InputLabel>
        {
            data.length > 0 ? (
                <Select
                labelId="demo-simple-select-filled-label"
                id="demo-simple-select-filled"
                value={selectedIndex !== null ? selectedIndex.toString() : ''}
                onChange={handleChange}
                sx={{
                    position: 'relative',
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    maxWidth: '60ch'
                }}
                >
                {data.map((item, index) => (
                    <MenuItem 
                        key={index} 
                        value={index}
                    >
                        <Typography
                        sx={{
                            position: 'relative',
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            maxWidth: '60ch'
                        }}
                        >
                        {item.signature}
                        </Typography>
                    </MenuItem>
                ))}
                </Select>
            ) : (
                <Alert severity="warning" sx={{ width: "60ch"}}> 
                No data available
                </Alert>
            )
        }
    </FormControl>
    {
        (selectedIndex !== null) &&
        <Paper square elevation={3} sx={{ p: 3 }}>
            <Stack spacing={{ xs: 1, sm: 2 }} useFlexGap flexWrap="wrap">
                <TextField
                    id="standard-contract-address"
                    label="Contract Address"
                    defaultValue={data[selectedIndex].contract_address}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                    color="success" 
                    focused
                />

                <TextField
                    id="standard-signer"
                    label="Signer"
                    defaultValue={data[selectedIndex].signer}
                    InputProps={{
                        readOnly: true,
                    }}
                    variant="standard"
                    color="success" 
                    focused
                />

                <TextField
                    id="standard-claim-amount"
                    label="Claim Amount"
                    type="number"
                    defaultValue={data[selectedIndex].amount}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                        readOnly: true,
                    }}
                    variant="standard"
                    color="success" 
                    focused
                />
                <Alert severity="info" sx={{ width: "60ch"}}> 
                    {"The contract will expire on: " + data[selectedIndex].expiration?.toLocaleString()}
                </Alert>
            </Stack>
        </Paper>
    }
    </Box>
    )
}

interface ResponseBody {
    message: string,
    verifiedSignatureData: VerifiedSignatureLogDataSchema[]
}

export default function ClaimPaymentForm ({
    isConnected,
    data,
    onChange
}: {
    isConnected: boolean,
    data: Partial<AccountDataSchema>,
    onChange: (data: Partial<AccountDataSchema>) => void,
}) {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const [verifiedSignatureData, setVerifiedSignatureData] = React.useState<VerifiedSignatureLogDataSchema[]>([])
    const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

    const handleFetch = async () => {
        const res = await fetchWithToast(`/api/log/verified-signatures?account=${data.account}`, {
            method: 'GET',
        })
        const bodyJson: ResponseBody = await res.json()
        if (res.ok) {
            setVerifiedSignatureData(bodyJson.verifiedSignatureData)
        }
    } 

    React.useEffect(() => {
        console.log("verified signatures:", verifiedSignatureData)
    }, [verifiedSignatureData]); 

    React.useEffect(() => {
        console.log("Selected index: ", selectedIndex)
    }, [selectedIndex])

    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionSuccess, setTransactionSuccess] = useState(false);

    const handleSubmit = async () => {
        setIsProcessing(true); 
        setTransactionSuccess(false);

        const contractAddress = (selectedIndex !== null) ? verifiedSignatureData[selectedIndex].contract_address : '';
        const amount = (selectedIndex !== null) ? verifiedSignatureData[selectedIndex].amount * 1000000000000000000 : 0;
        const signature = (selectedIndex !== null) ? verifiedSignatureData[selectedIndex].signature : '';

        const contract = new ethers.Contract(contractAddress, PaymentChannelABI, await provider.getSigner());

        try {
            const transaction = await contract.close(amount.toString(), signature);
            provider.waitForTransaction(transaction['hash']).then(
                async (TxReceipt: ethers.TransactionReceipt | null) => {
                
                console.log("close - TxReceipt", TxReceipt)
    
                if (TxReceipt && TxReceipt.status) {
                    setTransactionSuccess(true);
                } 
                setIsProcessing(false);
            }).catch((error) => {
                console.log('error', error);
                setIsProcessing(false);
                setTransactionSuccess(false);
            });
        } catch (error) {
            console.log(error)
            setIsProcessing(false);
            setTransactionSuccess(false);
        }
    }

    const steps: StepItem[] = [
        {
            label: 'Instruction',
            description: `To claim a payment, you need to verify the signature from the sender first.`,
            children: <InstructionStepForm />,
            continueLabel: null,
            handleNext: handleFetch
        },
        {
          label: 'Select Signature',
          description: `Select a verified signature to claim.`,
          children: <SelectSignatureStepForm 
                        data={verifiedSignatureData} 
                        selectedIndex={selectedIndex}
                        setSelectedIndex={setSelectedIndex}
                    />,
          continueLabel: 'Claim',
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
                    isProcessing && 
                    <CircularProgress color="inherit" />
                }
                {
                    transactionSuccess &&
                    <Box>
                        <Alert
                            severity="success"
                            sx={{ width: '100%' }}
                        >
                            <Typography>
                            Close contract successful.
                            </Typography>
                        </Alert>
                    </Box>
                }
                {
                    !isProcessing && !transactionSuccess &&
                    <Alert
                        severity="error"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Close contract failed.</Typography>
                        <Typography>Please try again.</Typography>
                    </Alert>
                }
                </Box>
            }
            />
        </Box>
    )
}

