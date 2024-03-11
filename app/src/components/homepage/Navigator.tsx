import { Link, Button, Card, Typography, CardActionArea } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

import HorizontalLayout from '@/app/src/components/layout/HorizontalLayout'
import '@/app/src/styles/homepage.css'; 

export default function Navigator() {
  const router = useRouter()

  return (
    <HorizontalLayout>
      <Card className="card">
        <CardActionArea onClick={() =>{
            router.push('/send')
          }}>
          <Typography variant="h5" component="h2" color="primary" className="title">
            Send -&gt;
          </Typography>
          <Typography variant="body2" color="secondary" className="description">
            Send SepoliaETH to another MetaMask wallet account.
          </Typography>
        </CardActionArea>
      </Card>
      <Card className="card">
        <CardActionArea onClick={() =>{
            router.push('/receive')
          }}>
          <Typography variant="h5" component="h2" color="primary" className="title">
            Receive -&gt;
          </Typography>
          <Typography variant="body2" color="secondary" className="description">
            Claim SepoliaETH sent from another MetaMask to you.
          </Typography>
        </CardActionArea>
      </Card>
      {/* <Card className="card">
        <CardActionArea onClick={() =>{
            router.push('/split-a-bill')
          }}>
          <Typography variant="h5" component="h2" color="primary" className="title">
            Split a Bill -&gt;
          </Typography>
          <Typography variant="body2" color="secondary" className="description">
            Send SepoliaETH to another MetaMask wallet account.
          </Typography>
        </CardActionArea>
      </Card>
      <Card className="card">
        <CardActionArea onClick={() =>{
            router.push('/transactions')
          }}>
          <Typography variant="h5" component="h2" color="primary" className="title">
            Transactions -&gt;
          </Typography>
          <Typography variant="body2" color="secondary" className="description">
            View recent transactions.
          </Typography>
        </CardActionArea>
      </Card> */}
    </HorizontalLayout>
  )
}

// const styles: Record<string, CSSProperties> = {
//   card: {
//     maxWidth: 345,
//     borderRadius: '8px'
//   },
//   title: {
//     marginBottom: '1rem',
//     fontWeight: 'bold'
//   },
//   description: {
//     opacity: 0.5,
//   },
// };