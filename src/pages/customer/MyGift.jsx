import React, { useState, useMemo } from "react";
import myGiftList from "../../data/customer/myGiftList";
import GiftListItem from "../../components/customer/gift/GiftListItem";
import { Box, Typography, Button, Tabs, Tab, Collapse } from '@mui/material';
import ReceiveGift from "../../components/customer/gift/ReceiveGift";
import SendGift from "../../components/customer/gift/SendGift";
import sendGiftList from "../../data/customer/sendGiftList";
import receiveGiftList from "../../data/customer/receiveGiftList";

function MyGift() {
    const MY_USER_NAME = "커피콩빵";
    const HARDCODED_DATE = "2025.10.26";
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'RECEIVED' | 'SENT'
  const [openIndex, setOpenIndex] = useState(null); // 드롭다운 오픈 인덱스

  const baseList = useMemo(() =>
    myGiftList.filter((it) => it.sender === MY_USER_NAME || it.receiver === MY_USER_NAME),
    []
  );
  const countAll = baseList.length;
  const countReceived = baseList.filter((it) => it.receiver === MY_USER_NAME).length;
  const countSent = baseList.filter((it) => it.sender === MY_USER_NAME).length;

  const filteredGiftList = useMemo(() => {
    if (filter === 'RECEIVED') return baseList.filter((it) => it.receiver === MY_USER_NAME);
    if (filter === 'SENT') return baseList.filter((it) => it.sender === MY_USER_NAME);
    return baseList; // ALL
  }, [filter, baseList]);
 const formatMessage = (item) => {
    let messageComponent = null;
    let isSent = false;
    
    // 볼드 처리 및 검은색 스타일
    const boldBlackStyle = { fontWeight: 'bold', color: 'black' };

    // 1. 내가 보낸 선물 (sender가 '커피콩빵'과 같다면)
    if (item.sender === MY_USER_NAME) {
      isSent = true;
      // {receiver}님에게 {productName}을 선물하셨습니다.
      messageComponent = (
        <>
          
          <Typography component="span" sx={boldBlackStyle}>
            {item.receiver}
          </Typography>
          님에게 &nbsp;
           <Typography component="span" sx={boldBlackStyle}>
            {item.productName}
          </Typography>
          을 선물하셨어요.
        </>
      );
    } 
    // 2. 내가 받은 선물 (receiver가 '커피콩빵'과 같다면)
    else if (item.receiver === MY_USER_NAME) {
      isSent = false;
      // {sender}님에게 {productName}을 선물받았습니다.
      messageComponent = (
        <>
          <Typography component="span" sx={boldBlackStyle}>
            {item.sender}
          </Typography>
          님에게 &nbsp;
           <Typography component="span" sx={boldBlackStyle}>
            {item.productName}
           </Typography>
           을 선물받았습니다.
        </>
      );
    } 
    // 3. 기타 (예외 처리)
    else {
        return { messageComponent: <Typography component="span">내역 오류</Typography>, isSent: false };
    }

    return { messageComponent, isSent };
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2, backgroundColor: 'white' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>내 선물함</Typography>
      </Box>
      <Tabs
        value={filter}
        onChange={(_, v) => setFilter(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', mt: 0.5, mb: 1 }}
      >
        <Tab value="ALL" label={`전체 (${countAll})`} />
        <Tab value="RECEIVED" label={`받은선물 (${countReceived})`} />
        <Tab value="SENT" label={`보낸선물 (${countSent})`} />
      </Tabs>
      {filteredGiftList.map((item, index) => {
        const { messageComponent, isSent } = formatMessage(item);
        const isMineSent = item.sender === MY_USER_NAME;
        const isMineReceived = item.receiver === MY_USER_NAME;
        const canToggle = isMineSent || isMineReceived;
        const handleClick = () => {
          if (canToggle) {
            setOpenIndex(openIndex === index ? null : index);
          }
        };
        return (
          <Box key={index} sx={{ mb: 1 }}>
            <Button
              fullWidth
              variant="text"
              onClick={handleClick}
              sx={{
                p: 0,
                justifyContent: 'flex-start',
                textTransform: 'none',
              }}
            >
              <GiftListItem
                messageComponent={messageComponent}
                date={HARDCODED_DATE}
                isSent={isSent}
              />
            </Button>

            {/* 내가 보낸 선물: SendGift 드롭다운 */}
            {isMineSent && (
              <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 1, pr: 1, pb: 1 }}>
                  <SendGift sendGiftList={sendGiftList} />
                </Box>
              </Collapse>
            )}

            {/* 내가 받은 선물: ReceiveGift 드롭다운 */}
            {isMineReceived && (
              <Collapse in={openIndex === index} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 1, pr: 1, pb: 1 }}>
                  <ReceiveGift receiveGiftList={receiveGiftList} />
                </Box>
              </Collapse>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default MyGift;
