import { Alert, Box, Button, Snackbar, SnackbarOrigin } from "@mui/material";
import React from "react";


export default function ConnectionAlertSnackbar({
    open,
    onClose
}: {
    open: boolean,
    onClose: (event?: React.SyntheticEvent | Event, reason?: string) => void
}) {
    const vertical = 'top';
    const horizontal = 'center'; 
    
    return (
        <Box sx={{ width: 500 }}>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          autoHideDuration={5000}
          onClose={onClose}
        >
            <Alert
                onClose={onClose}
                severity="warning"
                variant="filled"
                sx={{ width: '100%' }}
            >
                Please connect to your MetaMask account!
            </Alert>
        </Snackbar>
        </Box>
    )
}