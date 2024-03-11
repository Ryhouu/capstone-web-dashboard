
import { PaymentChannelDataSchema } from "@/app/src/components/schema/PaymentChannelDataSchema";
import { fetchWithToast } from "@/app/src/utils/toast";

import { Alert, Box, Button, CircularProgress, Typography } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from "react";

import * as React from 'react';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { DateTimePicker, DateTimeValidationError, DateValidationError, LocalizationProvider } from "@mui/x-date-pickers";
import VerticalLinearStepper, { StepItem } from "@/app/src/components/share/VerticalLinearStepper";
import { AccountDataSchema } from "@/app/src/components/schema/AccountDataSchema";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ethers } from "ethers";
import { getContractExpiration } from "@/app/contracts/utils";
import dayjs from "dayjs";
import { Contract } from "web3";
import { PaymentChannelABI } from "@/app/contracts/PaymentChannel-abi";
import CodeBlock from "@/app/src/components/share/CodeBlock";

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
    const [newExpirationError, setNewExpirationError] = React.useState<DateTimeValidationError | null>(null);
    
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

    const errorMessage = React.useMemo(() => {
        switch (newExpirationError) {
            case 'maxDate':
            case 'minDate': {
                return 'Please select a date time after the current expiration.';
            }

            case 'invalidDate': {
                return 'Your date is not valid';
            }

            default: {
                return '';
            }
        }
    }, [newExpirationError]);

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

    React.useEffect(() => {
        console.log("New expiration:", data.expirationDate)
        console.log("isVerified, ", data.isVerified)
    }, [data.expirationDate, data.isVerified])

        
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
                {"The current expiration is: " +
                    data.expirationDate?.toLocaleString().replace(/T/, ' ').replace(/\..+/, '')
                }
            </Alert>
        }

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker 
                label="New Expiration" 
                defaultValue={dayjs(data.expirationDate)}
                minDate={data.expirationDate ? dayjs(data.expirationDate).add(1, 'second') : dayjs()}
                onError={(newError) => setNewExpirationError(newError)}
                disablePast
                slotProps={{
                    textField: {
                      helperText: errorMessage,
                    },
                }}
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

export default function ExtendPaymentChannelForm ({
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

    const [isProcessing, setIsProcessing] = useState(false);
    const [transactionSuccess, setTransactionSuccess] = useState(false);

    const handleSubmit = async() => {
        setIsProcessing(true); 
        setTransactionSuccess(false);

        const contractAddress = contractData.contractAddress ? contractData.contractAddress : '';
        const contract = new ethers.Contract(
            contractAddress, 
            PaymentChannelABI, 
            await provider.getSigner()
        );
        const newExpirationUnix = dayjs(contractData.expirationDate).unix()
        console.log("newExpirationUnix", newExpirationUnix)

        try {
            const transaction = await contract.extend(newExpirationUnix);
    
            provider.waitForTransaction(transaction['hash']).then(
                async (TxReceipt: ethers.TransactionReceipt | null) => {
                    console.log("extend - TxReceipt", TxReceipt)
    
                if (TxReceipt && TxReceipt.status) {
                    setTransactionSuccess(true);
                    // const logReq = await fetch(
                    //     url + 'log-extendExpiration',
                    //     {
                    //         method: 'POST',
                    //         headers: { 'Content-Type': 'application/json' },
                    //         body: JSON.stringify({ 
                    //             currentAccount: document.getElementById('connect-metamask').textContent,
                    //             contractAddress: contractAddress,
                    //             newExpiration: newExpiration.toString()
                    //         })
                    //     }
                    // );
    
                    // document.getElementById('extend-contract-result').textContent = `This payment channel has been successfully extended to ${newExpiration} Unix time.`;
                } else {
                    // document.getElementById('extend-contract-result').textContent = 'Extension failed.' +
                    //                                                                 '\n\nPlease try again.';
                }
                setIsProcessing(false);
            }).catch((error) => {
                console.log(error);
                setIsProcessing(false);
                setTransactionSuccess(false);
            });
        }
        catch (error) {
            console.log(error);
            setIsProcessing(false);
            setTransactionSuccess(false);
        }
    }

    const steps: StepItem[] = [
        {
          label: 'Basic Info',
          description: `Fill in the required information to extend your payment channel contract.`,
          children: <BasicInfoStepForm {...props} provider={provider} />,
          continueLabel: 'Extend',
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
                                Payment channel successfully extended to {contractData.expirationDate?.toLocaleString()}.
                            </Typography>
                            {/* <Typography>Contract Address: </Typography> */}
                            <CodeBlock 
                                code={contractData.contractAddress ? contractData.contractAddress : ''} 
                                label='Contract Address'
                            />
                        </Alert>
                        {/* <Link href={`https://sepolia.etherscan.io/tx/${data.transactionHash}`} underline="hover">
                            View transaction on block explorer
                        </Link>
                        <Divider orientation="vertical" flexItem />
                        <Link href={`https://sepolia.etherscan.io/address/${data.contractAddress}`} underline="hover">
                            View contract on block explorer
                        </Link> */}
                    </Box>
                }
                {
                    !isProcessing && !transactionSuccess &&
                    <Alert
                        severity="error"
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        <Typography>Payment channel extension failed.</Typography>
                        <Typography>Please try again.</Typography>
                    </Alert>
                }
                </Box>
            }
            />
        </Box>
    )
}

