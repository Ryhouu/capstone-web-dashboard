'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import VerticalLayout from '@/app/src/components/layout/VerticalLayout'
import FormFieldSimpleLayout from '../../src/components/layout/FormFieldSimpleLayout'
import LengthLimitTextField from '../../src/components/layout/LengthLimitTextField'
import { Button, Typography } from '@mui/material'
import { PaymentChannelDataSchema } from '../../src/components/schema/PaymentChannelDataSchema'

const fields = {
    recipient: {
        label: 'Recipient Address',
        description: 'The receiver\'s MetaMask account.',
    },
    amount: {
      label: 'Amount',
      description: 'Amount (Wei) you want to send.',
    },
    expiration: {
      label: 'Expiration',
      description: 'The contract will expire after this number of hours.',
    },
}

export default function StartContractStepForm({
    data,
    onChange
}: {
    data: Partial<PaymentChannelDataSchema>,
    onChange: (data: Partial<PaymentChannelDataSchema>) => void
}) {
    
    return (
        <div style={{ paddingLeft: '10%', paddingTop: "30px" }}>
            <VerticalLayout>
                <FormFieldSimpleLayout {...fields.recipient} required>
                    <LengthLimitTextField
                        minLength={3}
                        maxLength={80}
                        name="recipient_address"
                        variant="outlined"
                        fullWidth
                        value={data.recipientAddress}
                        onChange={(e) => onChange({ recipientAddress: e.target.value })}
                    />
                </FormFieldSimpleLayout>
                <FormFieldSimpleLayout {...fields.amount} required>
                    <LengthLimitTextField
                        minLength={3}
                        maxLength={80}
                        name="amount_to_send"
                        variant="outlined"
                        fullWidth
                        value={data.amountSend}
                        onChange={(e) => onChange({ amountSend: parseInt(e.target.value) })}
                    />
                </FormFieldSimpleLayout>
                <FormFieldSimpleLayout {...fields.expiration} required>
                    <LengthLimitTextField
                        minLength={3}
                        maxLength={80}
                        name="expiration"
                        variant="outlined"
                        fullWidth
                        value={data.expiration}
                        onChange={(e) => onChange({ expiration: parseInt(e.target.value) })}
                    />
                </FormFieldSimpleLayout>
            </VerticalLayout>
            
        </div>

    )
}