'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import VerticalLayout from '../src/components/layout/VerticalLayout'
import { PaymentChannelDataSchema } from '../src/components/schema/PaymentChannelDataSchema'
import CenteredLayout from '../src/components/layout/CenteredLayout'
import { CSSProperties } from 'react'
import { Button, Typography, Card } from '@mui/material'
import MultiStepForm from '../src/components/share/MultiStepForm'
import { StepProp } from '../src/components/share/MultiStepForm'
import ConnectMetaMaskStepForm from './forms/ConnectMetaMaskStepForm'
import StartContractStepForm from './forms/StartContractStepForm'
import ConfirmContractStepForm from './forms/ConfirmContractStepForm'
import DeployContractStepForm from './forms/DeployContractStepForm'
import SignPaymentStepForm from './forms/SignPaymentStepForm'
import VerifySignatureStepForm from './forms/VerifySignatureStepForm'

const stepProps: StepProp[] = [
  {
    step: 1,
    label: "Connect to MetaMask",
  },
  {
    step: 2,
    label: 'Start Payment',
  },
  {
    step: 3,
    label: 'Confirm Contract',
  },
  {
    step: 4,
    label: 'Deploy Contract',
  },
  {
    step: 5,
    label: 'Sign Payment'
  },
  {
    step: 6,
    label: 'Verify Signature'
  }
]


export default function SendPaymentPage() {
    const router = useRouter()

    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [contractData, setContractData] = useState<Partial<PaymentChannelDataSchema>>({})

    const props = {
        isConnected: isConnected,
        data: contractData, 
        onChange: (data: Partial<PaymentChannelDataSchema>) => {
            setContractData({ ...contractData, ...data })
            if (data.senderAddress) {
                setIsConnected(true)
            }
        }
    }

    const stepForms = [
        <ConnectMetaMaskStepForm {...props} />,
        <StartContractStepForm {...props} />,
        <ConfirmContractStepForm {...props} />,
        <DeployContractStepForm {...props} />,
        <SignPaymentStepForm {...props} />,
        <VerifySignatureStepForm {...props} />
    ]

    const multiStepFormProps = {
        stepProps: stepProps,
        stepForms: stepForms
    }

    return (
        <div>
            <MultiStepForm { ...multiStepFormProps } />
            {isConnected && (
                <div>
                <Typography variant="h5" component="h2" color="primary" className="title">
                Connected to
                </Typography>
                <Typography variant="body2" color="secondary" className="description">
                { contractData.senderAddress }
                </Typography>
                </div>
            )}
        </div>
    )
}
