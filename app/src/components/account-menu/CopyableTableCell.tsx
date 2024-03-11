import React, { useState } from 'react';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSnackbar } from 'notistack';

interface CopyableTableCellProps {
    content: string;
    [key: string]: any; 
}

export default function CopyableTableCell ({ 
    content,
    ...props
}: CopyableTableCellProps) {
    const [showCopy, setShowCopy] = useState(false);
    const { enqueueSnackbar } = useSnackbar(); // Using Notistack

    const copyToClipboard = () => {
        navigator.clipboard.writeText(content).then(() => {
            enqueueSnackbar('Content copied to clipboard!', { variant: 'success' });
        }, () => {
            enqueueSnackbar('Failed to copy content', { variant: 'error' });
        });
    };

    return (
        <TableCell 
            onMouseEnter={() => setShowCopy(true)}
            onMouseLeave={() => setShowCopy(false)}
            sx={{
                position: 'relative',
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                maxWidth: '15ch' // Adjust the max width as necessary
            }}
            {...props}
        >
            {content}
            {showCopy && (
                <Tooltip title="Copy" placement="top">
                    <IconButton 
                        onClick={() => copyToClipboard()}
                        sx={{
                            position: 'absolute', 
                            top: '50%', 
                            right: 0,
                            transform: 'translateY(-50%)',
                            zIndex: 1 // Ensure this is above other content
                        }}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </TableCell>
    );
}
