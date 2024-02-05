'use client'

import { Typography } from '@mui/material'
import React from 'react'

import HorizontalLayout from './HorizontalLayout'

export type FormFieldSimpleLayoutProps = {
  children: React.ReactNode
  label: string
  description?: string
  required?: boolean
}

export default function FormFieldSimpleLayout({
  children,
  label,
  description,
  required = false,
}: FormFieldSimpleLayoutProps) {
  return (
    <div style={{ marginBottom: '1rem', alignItems: 'left'}}>
      <HorizontalLayout>
        <Typography variant="h6" component="p" color="primary">
          {label}
        </Typography>
        {required && (
          <Typography variant="h6" component="span" color="error">
            &nbsp;*
          </Typography>
        )}
      </HorizontalLayout>
      
      {description && (
        <Typography variant="body2" component="p" color="text.secondary">
          {description}
        </Typography>
      )}
      
      <div style={{ marginTop: '1rem' }}>{children}</div>
    </div>
  )
}
