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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import subList from "../../../data/customer/subList";
import subMenuListData from "../../../data/common/subMenuListData";

function CreateOrderPage() {
  // 구독권에서 주문하기로 넘어오는 경우
  const { state } = useLocation();
  const subscription = state?.subscription;

  const navigate = useNavigate();

  const [inventoryList, setInventoryList] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState("");
  const [orderType, setOrderType] = useState("IN");
  const [subMenu, setSubMenu] = useState(null); // 구독권별 메뉴

  // 음료 여러 개
  const [beverageOrders, setBeverageOrders] = useState([
    { menuId: "", qty: 1 },
  ]);

  // 디저트는 한 개만이라도 됨
  const [selectedDessert, setSelectedDessert] = useState("");
  const [dessertQty, setDessertQty] = useState(1);

  useEffect(() => {
    setInventoryList(subList);

    if (subscription) {
      setSelectedInventory(subscription.subId);
    } else if (subList.length > 0) {
      setSelectedInventory(subList[0].subId);
    }

    setSubMenu(subMenuListData);
  }, [subscription]);

  useEffect(() => {
    // TODO: selectedInventory 기준으로 다시 가져오기
    setSubMenu(subMenuListData);
  }, [selectedInventory]);

  const beverageMenus = subMenu?.menusByType?.BEVERAGE || [];
  const dessertMenus = subMenu?.menusByType?.DESSERT || [];
  const requiredTypes = subMenu?.orderRule?.requiredTypes || [];

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

  function requestOrder() {
    // 최종 주문하기
    // 주문 요청

    // navigate("/me/order/{orderId}");
    navigate("/me/order/1");
  }

  const payload = buildOrderPayload();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        주문하기
      </Typography>

      {/* 1. 구독권(매장) 선택 */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        주문 매장
      </Typography>

      <Select
        id="order-target-store"
        value={selectedInventory}
        onChange={(e) => setSelectedInventory(e.target.value)}
        fullWidth
      >
        {inventoryList.map((inventory) => (
          <MenuItem key={inventory.subId} value={inventory.subId}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={inventory.store.storeImage}
                alt={inventory.store.storeName}
              />
              <Box>
                <Typography variant="body2">
                  {inventory.store.storeName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {inventory.subName}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>

      {/* 2. 이용 타입 */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={orderType}
          exclusive
          onChange={(e, v) => v && setOrderType(v)}
          aria-label="order-type"
        >
          <ToggleButton value="IN">매장 이용</ToggleButton>
          <ToggleButton value="OUT">포장 이용</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 3. 메뉴 선택 */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        메뉴 선택
      </Typography>

      {/* ✅ 음료 여러 개 선택 */}
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

      {/* ✅ 디저트 선택 (단일) */}
      {dessertMenus.length > 0 && (
        <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
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
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ mb: 0.5, display: "block" }}>
              수량
            </Typography>
            <Select
              value={dessertQty}
              onChange={(e) => setDessertQty(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </Box>
        </Box>
      )}

      {/* 주문할 내역 */}
      {/* <pre>{JSON.stringify(payload, null, 2)}</pre> */}
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#eeeeeedd",
          width: "100%",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        {payload.items.map((menu) => (
          <Box
            key={menu.menuId + "-" + menu.menuName}
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
          >
            <Typography>
              {menu.menuName} {menu.qty > 1 ? `x ${menu.qty}` : ""}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "right",
        }}
      >
        <Button
          style={{ backgroundColor: "black", color: "white", width: "100px" }}
          onClick={requestOrder}
        >
          주문하기
        </Button>
      </Box>
    </Box>
  );
}

export default CreateOrderPage;
