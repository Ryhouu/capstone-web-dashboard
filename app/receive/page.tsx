'use client'
import * as React from 'react';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Divider from '@mui/material/Divider';
import { PaymentChannelDataSchema } from '../src/components/schema/PaymentChannelDataSchema';

import ListItemIcon from '@mui/material/ListItemIcon';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import VerifiedIcon from '@mui/icons-material/Verified';
import CloseIcon from '@mui/icons-material/Close';

import { styled, useTheme } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { Backdrop, ListItemText } from '@mui/material';
import VerifySignatureForm from './forms/VerifySignatureForm';
import ClaimPaymentForm from './forms/ClaimPaymentForm';

import { AppBar, DrawerHeader, Main, drawerWidth } from '../src/components/layout/MainLayoutWithDrawer';
import AccountMenu from '../src/components/share/AccountMenu';
import { AccountDataSchema } from '../src/components/schema/AccountDataSchema';
import PaymentSignaturesTable from '../src/components/account-menu/PaymentSignaturesTable';
import PaymentChannelsTable from '../src/components/account-menu/PaymentChannelsTable';
import ConnectionAlertSnackbar from '../src/components/account-menu/alerts/ConnectionAlertSnackbar';
import VerifiedSignaturesTable from '../src/components/account-menu/VerifiedSignaturesTable';

export default function ReceiveMainPage() {
    const router = useRouter()

    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [accountData, setAccountData] = useState<Partial<AccountDataSchema>>({})

    const accountMenuProps = {
        isConnected: isConnected,
        data: accountData, 
        onChange: (data: Partial<AccountDataSchema>) => {
            setAccountData({ ...accountData, ...data, isReceiver: true, isSender: false })
            if (data.account) {
                setIsConnected(true)
            }
        }
    }

    const theme = useTheme();
    const [open, setOpen] = useState(true);
  
    const handleDrawerOpen = () => {
      setOpen(true);
    };
  
    const handleDrawerClose = () => {
      setOpen(false);
    };

    const [connectionAlertOpen, setConnectionAlertOpen] = useState<boolean>(false);
    const handleCloseAlert = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setConnectionAlertOpen(false);
    };

    const forms = [
        <VerifySignatureForm {...accountMenuProps} />,
        <ClaimPaymentForm {...accountMenuProps} />
    ]

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeForm, setActiveForm] = useState<React.ReactElement>()

    const handleListItemClick = (
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
        index: number,
    ) => {
        setSelectedIndex(index);
        if (isConnected) {
            setActiveForm(forms[index])
            setConnectionAlertOpen(false)
        }
        else {
            setConnectionAlertOpen(true)
        }
    };

    const [openVerifiedSignatures, setOpenVerifiedSignatures] = React.useState(false)
    const handleOpenVerifiedSignatures = async () => {
        setOpenVerifiedSignatures(true)
    }
    const handleCloseVerifiedSignatures = () => {
        setOpenVerifiedSignatures(false)
    }

    const [openPaymentChannels, setOpenPaymentChannels] = React.useState(false)
    const handleClosePaymentChannels = () => {
        setOpenPaymentChannels(false)
    }
    const handleOpenPaymentChannels = async () => {
        setOpenPaymentChannels(true)
    }

    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              Receive Payment
            </Typography>
            <AccountMenu 
                {...accountMenuProps}
                handleOpenPaymentSignatures={handleOpenVerifiedSignatures}
                handleOpenPaymentChannels={handleOpenPaymentChannels}
            />
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>

          <Divider />
          <List component="nav">
            {actionItems.map((item, index) => (
            <ListItem key={item.label} disablePadding>
                <ListItemButton
                    selected={selectedIndex === index}
                    onClick={(event) => handleListItemClick(event, index)}
                >
                <ListItemIcon>
                    { item.icon }
                </ListItemIcon>
                <ListItemText primary={item.label} />
                </ListItemButton>
            </ListItem>
            ))}
          </List>

          <Divider />
          <List>
            <ListItem key={"Home"} disablePadding>
                <ListItemButton
                    onClick={() => {
                        router.push('/')
                    }}
                >
                  <ListItemIcon>
                    <HomeIcon/>
                  </ListItemIcon>
                  <ListItemText primary={"Home"} />
                </ListItemButton>
            </ListItem>
          </List>
        </Drawer>

        <Main open={open}>
          <DrawerHeader />
          { activeForm }
          <ConnectionAlertSnackbar open={connectionAlertOpen} onClose={handleCloseAlert} />
        </Main>

        <Backdrop
            sx={{ 
                color: '#fff', 
                zIndex: (theme) => (theme.zIndex.drawer + 1),
                padding: '20px',
                display: 'flex',   
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 2,             
            }}
            open={openVerifiedSignatures}
        >
            {
                accountData.isReceiver && 
                <VerifiedSignaturesTable accountData={accountData} open={openVerifiedSignatures} />
            }
            <IconButton aria-label="close" onClick={handleCloseVerifiedSignatures}>
                <CloseIcon />
            </IconButton>
        </Backdrop>

        <Backdrop
            sx={{ 
                color: '#fff', 
                zIndex: (theme) => (theme.zIndex.drawer + 1),
                padding: '20px',
                display: 'flex',     
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,         
            }}
            open={openPaymentChannels}
        >
            <PaymentChannelsTable accountData={accountData} open={openPaymentChannels} />
            <IconButton aria-label="close" onClick={handleClosePaymentChannels}>
                <CloseIcon />
            </IconButton>
        </Backdrop>
      </Box>
    );
}

const actionItems = [
    {
        label: "Verify Signature",
        icon: <VerifiedIcon />,
    },
    {
        label: "Claim Payment",
        icon: <RequestQuoteIcon />,
    },
]