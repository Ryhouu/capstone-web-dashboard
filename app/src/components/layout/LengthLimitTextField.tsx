'use client'

import {
  CircularProgress,
  InputAdornment,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material'
import { useState } from 'react'

type LengthLimitTextFieldProps = {
  minLength?: number
  maxLength: number
} & TextFieldProps

export default function LengthLimitTextField({
  minLength = 0,
  maxLength,
  value,
  onChange,
  ...restProps
}: LengthLimitTextFieldProps) {
  const curLength = typeof value === 'string' ? value.length : -1

  return (
    <TextField
      {...restProps}
      value={value}
      onChange={(e) => {
        if (e.target.value.length > maxLength) {
          return
        }
        if (onChange) {
          onChange(e)
        }
      }}
      inputProps={{
        ...restProps.inputProps,
        minLength: minLength,
        maxLength: maxLength,
      }}
      InputProps={{
        ...restProps.InputProps,
        ...(curLength >= 0 && {
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                position: 'absolute',
                right: '1rem',
                bottom: '1rem',
              }}
            >
              <Typography
                variant="caption"
                color={
                  curLength < minLength || curLength >= maxLength
                    ? 'error'
                    : 'inherit'
                }
              >
                {curLength}/{maxLength}
              </Typography>
            </InputAdornment>
          ),
        }),
      }}
    />
  )
}

export function AutoSaveLengthLimitTextField({
  value,
  onSave,
  ...restProps
}: {
  value: string
  onSave: (value: string) => void
} & LengthLimitTextFieldProps) {
  const [localValue, setLocalValue] = useState(value)
  const [isError, setIsError] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (localValue === value) {
      return
    }
    setIsError(false)
    setIsSaving(true)
    try {
      await onSave(localValue)
    } catch (error) {
      setIsError(true)
    }
    setIsSaving(false)
  }

  return (
    <LengthLimitTextField
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleSave}
      error={isError}
      disabled={restProps.disabled || isSaving}
      InputProps={{
        ...restProps.InputProps,
        ...(isSaving && {
          startAdornment: (
            <InputAdornment position="start">
              <CircularProgress size={16} color="inherit" />
            </InputAdornment>
          ),
        }),
      }}
      {...restProps}
    />
  )
}
