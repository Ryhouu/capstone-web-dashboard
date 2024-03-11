import ArrowForwardOutlinedIcon from '@mui/icons-material/ArrowForwardOutlined'

import {
    Button,
    Card,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
  } from '@mui/material'
  import Link from 'next/link'
  
export default function RowItemCard({
    title,
    description,
    href,
    icon,
}: {
    title: string
    description: string
    href: string
    icon?: React.ReactNode
}) {
    return (
      <Card variant="outlined" style={{ width: '100%' }}>
        <Link href={href} passHref>
          <Button variant="text" color="inherit" fullWidth style={{ padding: 0 }}>
            <ListItem dense>
              {icon && <ListItemIcon>{icon}</ListItemIcon>}
              <ListItemText
                primary={<Typography variant="h6">{title}</Typography>}
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    {description}
                  </Typography>
                }
              />
              <ListItemIcon sx={{ marginLeft: '0.5rem' }}>
                <ArrowForwardOutlinedIcon />
              </ListItemIcon>
            </ListItem>
          </Button>
        </Link>
      </Card>
    )
}
  