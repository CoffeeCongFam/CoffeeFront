import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';

function DetailItem({ label, value }) {
  return (
    <Grid container item xs={12} spacing={1}>
      <Grid item xs={4}>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>{label}</Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{value}</Typography>
      </Grid>
    </Grid>
  );
}

function SendGiftDetail({ item, formatKST }) {
  if (!item) return null;

  return (
    <Paper elevation={0} sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: 2 }}>
      <Grid container spacing={1.5}>
        {/* Who sent to whom */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            <span style={{ fontWeight: 'bold' }}>{item.sender}</span>님이 <span style={{ fontWeight: 'bold' }}>{item.receiver}</span>님에게
          </Typography>
        </Grid>

        {/* Gift Message */}
        {item.giftMessage && (
          <Grid item xs={12}>
            <Box sx={{ p: 1.5, border: '1px dashed grey', borderRadius: 1, mb: 1 }}>
              <Typography variant="body2">"{item.giftMessage}"</Typography>
            </Box>
          </Grid>
        )}

        {/* Subscription Image Placeholder */}
        <Grid item xs={12} md={4}>
           <Box sx={{ 
             height: 120, 
             backgroundColor: 'grey.200', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             borderRadius: 1,
             color: 'text.secondary'
            }}>
             <Typography variant="body2">이미지</Typography>
           </Box>
        </Grid>

        {/* Details */}
        <Grid container item xs={12} md={8} spacing={1}>
          <DetailItem label="구독권" value={item.subscriptionName} />
          <DetailItem label="구독기간" value={`${item.subscriptionPeriod}일`} />
          <DetailItem label="매장" value={item.storeName} />
          <DetailItem label="구독타입" value={item.subscriptionType} />
          <DetailItem label="금액" value={`${item.price.toLocaleString()}원`} />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        {/* Payment Info */}
        <Grid container item xs={12} spacing={1}>
          <DetailItem label="결제수단" value={item.purchaseType} />
          <DetailItem label="결제일시" value={formatKST(item.paidAt)} />
        </Grid>

      </Grid>
    </Paper>
  );
}

export default SendGiftDetail;