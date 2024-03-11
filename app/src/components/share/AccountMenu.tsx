import { styled, useTheme } from '@mui/material/styles';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { Avatar, Backdrop, Box, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { PaymentChannelDataSchema } from '../schema/PaymentChannelDataSchema';
import React from 'react';
import { Logout, PersonAdd, Settings } from '@mui/icons-material';
import StorageIcon from '@mui/icons-material/Storage';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import { ethers, Wallet } from 'ethers';
import { AccountDataSchema } from '../schema/AccountDataSchema';
import PaymentSignaturesTable from '../account-menu/PaymentSignaturesTable';
import { fetchWithToast } from '../../utils/toast';

export default function AccountMenu ({
    isConnected,
    data,
    onChange,
    handleOpenPaymentSignatures, // TODO
    handleOpenPaymentChannels,
}: {
    isConnected: boolean,
    data: Partial<AccountDataSchema>,
    onChange: (data: Partial<AccountDataSchema>) => void,
    handleOpenPaymentSignatures: () => void,
    handleOpenPaymentChannels: () => void,
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleConnect = async () => {
    let ethereum;
    if (typeof window !== 'undefined') {
        await window.ethereum.enable();
        ethereum = window.ethereum;
        console.log("ethereum", ethereum);
    }

    if (!ethereum) {
        console.log('Ethereum object not found');
        return;
    }
    try {
        const accounts: string[] = await ethereum.request({ 
            method: "eth_requestAccounts" 
        });
        const provider = new ethers.BrowserProvider(window.ethereum);

        onChange({ account: accounts[0]})
        console.log("account:", data.account)

        window.ethereum.on('accountsChanged', (accounts: string[]) => {
            onChange({ account: accounts[0]})
        });
    } catch (error) {
        console.log(error);
    }
  }

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        {/* <Typography sx={{ minWidth: 100 }}>Contact</Typography>
        <Typography sx={{ minWidth: 100 }}>Profile</Typography> */}
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}>M</Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleClose}>
          <Avatar /> {isConnected ? data.account : "My Account"}
        </MenuItem>
    
        <MenuItem onClick={handleOpenPaymentChannels}>
          <ListItemIcon>
            <StorageIcon fontSize="small" />
          </ListItemIcon>
          My Payment Channels
        </MenuItem>
        <MenuItem onClick={handleOpenPaymentSignatures}>
          <ListItemIcon>
            <SaveAsIcon fontSize="small" />
          </ListItemIcon>
          My Signatures
        </MenuItem>

        <Divider />
        <MenuItem onClick={handleConnect}>
          <ListItemIcon>
            <PersonAdd fontSize="small" />
          </ListItemIcon>
          Connect MetaMask
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}