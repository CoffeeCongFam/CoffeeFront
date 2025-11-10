import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";

function formatPrice(n) {
  if (n === null || n === undefined) return "-";
  try {
    return n.toLocaleString("ko-KR");
  } catch (e) {
    console.log(e);
    const num = Number(n);
    return Number.isFinite(num) ? num.toLocaleString("ko-KR") : String(n);
  }
}

function formatPaidAt(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    // 2025.10.26  13:28 형태
    const y = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${y}.${mm}.${dd}  ${hh}:${mi}`;
  } catch (e) {
    console.log(e);
    return String(iso);
  }
}

/**
 * @param {{ sendGiftList?: Array<{id?: string|number, sender: string, receiver: string, storeName: string, productName: string, price: number, subscriptionPeriod: number|string, paidAt: string, purchaseType: string, giftMessage?: string, purchaseId?: string|number}> }} props
 */
function SendGift({ sendGiftList = [] }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {sendGiftList.map((g) => (
        <Paper
          key={g.id ?? `${g.sender}-${g.receiver}-${g.paidAt}`}
          sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}
          elevation={0}
        >
          {/* 보내는/받는 사람 */}
          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={5}>
              <Stack spacing={0.5}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={700}
                >
                  보내는 사람
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  {g.sender}
                </Typography>
              </Stack>
            </Grid>

              <Grid item xs={2} sx={{ textAlign: "center" }}>
                <ArrowRightAltIcon sx={{ fontSize: 36 }} />
              </Grid>
            <Grid item xs={2} sx={{ textAlign: "center" }}>
              <ArrowRightAltIcon sx={{ fontSize: 36 }} />
            </Grid>
            <Grid item xs={5}>
              <Stack spacing={0.5} alignItems="flex-end">
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  fontWeight={700}
                >
                  받는 사람
                </Typography>
                <Typography variant="h6" fontWeight={500}>
                  {g.receiver}
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          {/* 선물메시지 */}
          {g.giftMessage && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                선물메시지
              </Typography>
              <Chip label={g.giftMessage} sx={{ fontSize: 14 }} />
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* 선물 정보 */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
              선물 정보
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  카페명
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{g.storeName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  구독권명
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{g.productName}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  금액
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{formatPrice(g.price)} 원</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  구독 기간
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">
                  {g.subscriptionPeriod}개월
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* 결제 정보 */}
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>
              결제 정보
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  결제 금액
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{formatPrice(g.price)} 원</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  승인 일시
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{formatPaidAt(g.paidAt)}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  승인 번호
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{g.purchaseId}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography color="text.secondary" fontWeight={700}>
                  결제 수단
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography align="right">{g.purchaseType}</Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      ))}

      {sendGiftList.length === 0 && (
        <Typography color="text.secondary">
          보낸 선물 내역이 없습니다.
        </Typography>
      )}
    </Box>
  );
}

export default SendGift;
