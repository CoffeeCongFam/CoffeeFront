import React from "react";
import myGiftList from "../../data/customer/myGiftList";
import GiftListItem from "../../components/customer/gift/GiftListItem";
import { Box, Typography } from '@mui/material';

function MyGift() {
    const MY_USER_NAME = "커피콩빵";
    const HARDCODED_DATE = "2025.10.26";
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
        <h2>내 선물함</h2>
      {myGiftList.map((item, index) => {
        
        // 내가 보거나 받은 내역만 처리
        if (item.sender === MY_USER_NAME || item.receiver === MY_USER_NAME) {
            const { messageComponent, isSent } = formatMessage(item);
            return (
                <GiftListItem
                    key={index}
                    messageComponent={messageComponent}
                    date={HARDCODED_DATE}
                    isSent={isSent}
                />
            );
        }
        return null;
      })}
    </Box>
  );
}

export default MyGift;
