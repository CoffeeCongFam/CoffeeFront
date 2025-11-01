import React, { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  MenuItem,
  Select,
  Box,
  Typography,
  Avatar,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Button,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from "@mui/icons-material/Add";
import subList from "../../../data/customer/subList";
import subMenuListData from "../../../data/common/subMenuListData";
import useAppShellMode from "../../../hooks/useAppShellMode";
import api from "../../../utils/api";

function CreateOrderPage() {

  const { isAppLike } = useAppShellMode();
  
  // 구독권에서 주문하기로 넘어오는 경우
  const { state } = useLocation();
  const subscription = state?.subscription;

  const navigate = useNavigate();

  const [inventoryList, setInventoryList] = useState([]);   // 보유 구독권 목록
  const [selectedInventory, setSelectedInventory] = useState(""); // 사용할 구독권
  const [orderType, setOrderType] = useState("IN");   // 매장 || 포장
  const [subMenu, setSubMenu] = useState(null);       // 구독권별 메뉴

  const [isLoading, setIsLoading] = useState(false);   // 주문하기 처리 로딩

  // 음료 여러 개
  const [beverageOrders, setBeverageOrders] = useState([
    { menuId: "", qty: 1 },
  ]);

  // 디저트는 한 개만이라도 됨
  const [selectedDessert, setSelectedDessert] = useState("");
  const [dessertQty, setDessertQty] = useState(1);

  useEffect(() => {
    // 소비자 보유 구독권 목록 가져오기
    // /api/customers/subscriptions
    (async () => {
      try{
        const res = await api.get("/customers/subscriptions");
        const list = res.data?.data ?? [];
        setInventoryList(list);  

        // 이전 페이지에서 특정 구독권 id 를 들고 왔으면 
        // 해당 구독권 미리 선택됨
        if(subscription?.subId){
          setSelectedInventory(subscription.subId); 
        }else if(list.length > 0){
          // 아니면 첫번째 보유 구독권으로 자동 선택됨
          setSelectedInventory(list[0].subId);
        }
      }catch(err){
          console.error("구독권 목록 조회 실패: ", err);

          // 실패했을 때 더미데이터 넣기 
          setInventoryList(subList); // subList 는 dummy data

        }
    })();
    
  }, [subscription]);

  // 구독권 바뀔 때마다 메뉴 구조 다시 넣기 (지금은 공통 더미)
  useEffect(() => {
    setSubMenu(selectedInventory.menuList || subMenuListData);
  }, [selectedInventory]);

  const beverageMenus = subMenu?.menusByType?.BEVERAGE || [];
  const dessertMenus = subMenu?.menusByType?.DESSERT || [];
  const requiredTypes = subMenu?.orderRule?.requiredTypes || [];

  // 구독권 선택
  function handleSelectInventory(subId){
    const targetInventory = inventoryList.find((it) => it.subId === subId);
    if (!targetInventory) {
      console.warn("선택한 구독권을 찾을 수 없습니다.");
      return;
    }
    // 잔여 횟수 체크
    if (targetInventory.remainingCount <= 0) {
      alert("해당 구독권은 남은 잔수가 없어 주문할 수 없습니다.");
      return; 
    }
    setSelectedInventory(subId);
  }

  // 음료 행 하나 업데이트
  function handleChangeBeverage(index, key, value) {
    setBeverageOrders((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        [key]: value,
      };
      return next;
    });
  }

  // 음료 행 추가
  function handleAddBeverage() {
    setBeverageOrders((prev) => [...prev, { menuId: "", qty: 1 }]);
  }

  // 음료 행 삭제
  function handleRemoveBeverage(index) {
    setBeverageOrders((prev) => prev.filter((_, i) => i !== index));
  }

  // 최종 주문
  function buildOrderPayload() {
    const items = [];

    // 음료들
    beverageOrders.forEach((bo) => {
      if (bo.menuId) {
        // 선택된 음료 id에 해당하는 메뉴 정보 찾기
        const menuInfo = beverageMenus.find((m) => m.menuId === bo.menuId);

        items.push({
          menuId: bo.menuId,
          menuName: menuInfo ? menuInfo.name : "", // ← 여기!
          qty: bo.qty,
        });
      }
    });

    // 디저트
    if (selectedDessert) {
      const dessertInfo = dessertMenus.find(
        (m) => m.menuId === selectedDessert
      );

      items.push({
        menuId: selectedDessert,
        menuName: dessertInfo ? dessertInfo.name : "",
        qty: dessertQty,
      });
    }

    return {
      subId: selectedInventory,
      orderType,
      items,
    };
  }

  // 최종 주문 요청 처리
  async function requestOrder() {
    // 구독권 || 메뉴 선택하지 않았으면 alert
    if (!selectedInventory) {
      alert("구독권을 선택해주세요.");
      return; 
    }

    // 선택된 구독권 객체 찾기 
    const selectedSub = inventoryList.find(
      (item) => item.subId === selectedInventory
    );

    if (!selectedSub) {
      alert("주문할 구독권을 찾을 수 없어요.");
      return;
    }

    // TODO. memberId 가져오기
    const memberId = 23;    // test

    // storeId, memberSubscriptionId 매핑
    const storeId = selectedSub.store?.partnerStoreId 
      || selectedSub.store?.storeId || selectedSub.storeId ;
    const memberSubscriptionId = selectedSub.subId;

    // 메뉴 배열 만들기
    const menu = [];

    // 음료
    beverageOrders.forEach((bo) => {
      if(bo.menuId){
        menu.push({
          menuId: bo.menuId,
          count: bo.qty,
        })
      }
    })

    // 디저트
    if (selectedDessert) {
      menu.push({
        menuId: selectedDessert,
        count: dessertQty,
      });
    }

    // 메뉴 선택하지 않았다면 주문 막기
    if (menu.length === 0) {
      alert("주문할 메뉴를 선택해 주세요.");
      return;
    }

    // 최종 payload
    const orderPayload = {
      memberId,
      storeId,
      memberSubscriptionId,
      orderType: orderType,
      menu,
    }

    try{
      setIsLoading(true);
      console.log("주문 요청>> ",orderPayload)

      const res = await api.post("/me/orders/new", orderPayload);
      const orderId = res.data?.data?.orderId;

      if(orderId){
        // 주문 상세 페이지로 이동
        navigate(`/me/order/${orderId}`);
      }else{
        // orderId
        navigate(-1);
      }

    } catch(err){
      console.error("주문 요청 실패: ", err);
      alert("주문에 실패했어요. 다시 시도해 주세요.")
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }

  // 뒤로 이동
  function handleBack() {
    navigate(-1);
  }

  const payload = buildOrderPayload();

  return (
    <Box sx={{ px: isAppLike ? 3 : 30, py: 3, pb: 10 }}>
      {/* 뒤로가기 */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

       {/* 제목 */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant={isAppLike ? "h6" : "h5"} fontWeight={'bold'}>주문하기</Typography>
      </Box>

      <Box
      style={{display: 'flex' , flexDirection: "column", justifyContent: "space-btween"}} 
      sx={{ px: isAppLike ? 0 : 20, mt: isAppLike ? 0 : 7  }}>
        <Box>
          {/* 1. 구독권(매장) 선택 */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            주문 매장
          </Typography>

          <Select
            id="order-target-store"
            value={selectedInventory}
            onChange={(e) => handleSelectInventory(e.target.value)}
            fullWidth
          >
            {inventoryList.map((inventory) => (
              <MenuItem key={inventory.subId} value={inventory.subId}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={inventory.store.storeImg}
                    alt={inventory.store.storeName}
                  />
                  <Box>
                    <Typography variant="body2">
                      {inventory.store.storeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {inventory.subName}
                        {/* 남은 잔수도 같이 보여주고 싶으면 */}
                        {typeof inventory.remainingCount === "number"
                          ? ` · 남은잔 ${inventory.remainingCount}잔`
                          : null}
                        {/* 미사용 상태면 */}
                        {inventory.isExpired === "NOT_ACTIVATED" ? " · 미사용" : ""}
                      </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>

          {/* 2. 이용 타입 */}
          <Box sx={{ mt: 2, mb: 2 }} >
            <Box sx={{ display: "flex", gap: 1 }}>
              <ToggleButtonGroup
                color="primary"
                value={orderType}
                exclusive
                onChange={(e, v) => v && setOrderType(v)}
                aria-label="order-type"
                sx={{
                  width: "100%",
                  "& .MuiToggleButton-root": {
                    flex: 1,
                  },
                }}
              >
                <ToggleButton value="IN">매장 이용</ToggleButton>
                <ToggleButton value="OUT">포장 이용</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* 3. 메뉴 선택 */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            메뉴 선택
          </Typography>

          {/* 음료 여러 개 선택 */}
          {beverageMenus.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ mb: 1, display: "block" }}>
                음료 선택 {requiredTypes.includes("BEVERAGE") ? "(필수)" : ""}
              </Typography>

              {beverageOrders.map((bo, index) => (
                <Box
                  key={index}
                  sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}
                >
                  {/* 음료 선택 */}
                  <Select
                    value={bo.menuId || ""}
                    onChange={(e) =>
                      handleChangeBeverage(index, "menuId", e.target.value)
                    }
                    fullWidth
                  >
                    {beverageMenus.map((menu) => (
                      <MenuItem key={menu.menuId} value={menu.menuId}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar src={menu.menuImage} alt={menu.name} />
                          {menu.name} ({menu.price.toLocaleString()}원)
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>

                  {/* 수량 */}
                  <Select
                    value={bo.qty}
                    onChange={(e) =>
                      handleChangeBeverage(index, "qty", Number(e.target.value))
                    }
                    sx={{ width: 80 }}
                  >
                    <MenuItem value={1}>1</MenuItem>
                    <MenuItem value={2}>2</MenuItem>
                    <MenuItem value={3}>3</MenuItem>
                  </Select>

                  {/* 삭제 버튼 (첫 행은 안 지워도 되게 조건 걸어도 됨) */}
                  {beverageOrders.length > 1 && (
                    <IconButton onClick={() => handleRemoveBeverage(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}

              {/* 행 추가 버튼 */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddBeverage}
              >
                음료 추가
              </Button>
            </Box>
          )}

          {/* 디저트 선택 (단일) */}
          {dessertMenus.length > 0 && (
            <Box sx={{ mb: 2, display: "flex", gap: 1 , alignItems: "flex-end"}}>
              <Box sx={{ flex: 3 }}>
                <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
                  디저트 선택{" "}
                  {requiredTypes.includes("DESSERT") ? "(필수)" : "(선택)"}
                </Typography>
                <Select
                  value={selectedDessert}
                  onChange={(e) => setSelectedDessert(e.target.value)}
                  fullWidth
                  displayEmpty
                >
                  {!requiredTypes.includes("DESSERT") && (
                    <MenuItem value="">
                      <em>선택 안 함</em>
                    </MenuItem>
                  )}
                  {dessertMenus.map((menu) => (
                    <MenuItem key={menu.menuId} value={menu.menuId}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Avatar src={menu.menuImage} alt={menu.name} />
                        {menu.name} ({menu.price.toLocaleString()}원)
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </Box>

              {/* 수량 */}
              <Box sx={{ mt: 0.5}}>
                <Select
                  value={dessertQty}
                  onChange={(e) => setDessertQty(Number(e.target.value))}
                  sx={{
                    width: 80,
                    "& .MuiSelect-select": {
                      height: "100%",              
                      display: "flex",
                      alignItems: "center",       
                    },
                  }}
                >
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                </Select>
              </Box>
            </Box>
          )}
        </Box>
        {/* 주문 내역 미리보기 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#eeeeeedd",
            width: "100%",
            minHeight: "120px",
            p: 3,
            borderRadius: 2,
            mt: 5,
            mb: 2,
            gap: 0.5,
          }}
        >
          <Box sx={{display:'flex', flexDirection:'row', gap: 1, alignContent: "center", mb: 2}}>
          <ShoppingCartIcon/><Typography fontWeight={'bold'}>장바구니</Typography>
          </Box>
          {payload.items.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              선택한 메뉴가 없습니다.
            </Typography>
          ) : (
            payload.items.map((menu) => (
              <Box
                key={menu.menuId + "-" + menu.menuName}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <Typography>
                  {menu.menuName} {menu.qty > 1 ? `x ${menu.qty}` : ""}
                </Typography>
              </Box>
            ))
          )}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            sx={{ backgroundColor: "black", color: "white", width: 100 }}
            onClick={requestOrder}
          >
            주문하기
          </Button>
        </Box>
      </Box>

      <Backdrop
        open={isLoading}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.modal + 2,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" />
          <Typography variant="body1" sx={{ mt: 1 }}>
            주문이 진행 중입니다 ...
          </Typography>
      </Backdrop>
    </Box>
  );
}

export default CreateOrderPage;
