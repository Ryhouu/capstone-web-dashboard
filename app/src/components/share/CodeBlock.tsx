import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import { useSnackbar } from 'notistack';
import { TextField } from '@mui/material';

export default function CodeBlock ({ 
    code,
    label
}: {
    code: string,
    label: string
}) {
    const { enqueueSnackbar } = useSnackbar(); // Using notistack for snackbar notifications

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code).then(() => {
            enqueueSnackbar('Code copied to clipboard!', { variant: 'success' });
        }, () => {
            enqueueSnackbar('Failed to copy code', { variant: 'error' });
        });
    };

    return (
        <Box sx={{ position: 'relative' }}>
            {/* <Typography component="pre" sx={{ overflow: 'auto', backgroundColor: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
                {code}
            </Typography> */}
            <TextField
                label={label}
                multiline
                fullWidth
                defaultValue={code}
                variant="filled"
                InputProps={{
                    readOnly: true,
                }}
            />
            <Button
                variant="contained"
                size="small"
                sx={{ position: 'absolute', top: '8px', right: '8px' }}
                onClick={copyToClipboard}
                startIcon={<ContentCopyIcon />}
            >
                Copy
            </Button>
        </Box>
    );
};
