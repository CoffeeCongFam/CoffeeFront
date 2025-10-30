import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import storeDetail from "../../data/customer/storeDetail.js";

function StoreDetailPage() {
  const { storeId } = useParams();
  console.log(storeId)

  const [store, setStore] = useState({
    storeId: null,
    storeName: "",
    summary: "",
    address: "",
    phone: "",
    storeHours: [],   // <= 중요
  });

  useEffect(() => {
    // 여기서 api 호출했다고 생각
    setStore(storeDetail);
  }, []);

  return (
    <Box sx={{ px: 10, py: 2 }}>
      <h2>{store.storeName}</h2>

      <p>{store.summary}</p>
      <p>{store.address}</p>
      <p>{store.phone}</p>

      <h4>운영 시간</h4>
      {/* ✅ 여기서도 한 번 더 안전하게 */}
      {store.storeHours?.map((day) => (
        <div key={day.dayOfWeek}>
          {day.dayOfWeek} :{" "}
          {day.isHoliday ? "휴무" : `${day.openTime} ~ ${day.closeTime}`}
        </div>
      ))}
    </Box>
  );
}

export default StoreDetailPage;
