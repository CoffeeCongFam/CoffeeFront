import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import subList from "../../../data/customer/subList";
import useAppShellMode from "../../../hooks/useAppShellMode";
import {
  fetchUserSubscriptions,
  requestNewOrder,
} from "../../../apis/customerApi";
import useUserStore from "../../../stores/useUserStore";
import menuDummy from "../../../assets/menuDummy.jpg";

function CreateOrderPage() {
  const { isAppLike } = useAppShellMode();
  const navigate = useNavigate();
  const { state } = useLocation();
  const subscription = state?.subscription;

  const { authUser } = useUserStore();

  const [inventoryList, setInventoryList] = useState([]); // 보유 구독권 목록
  const [selectedInventory, setSelectedInventory] = useState(null); // 선택한 구독권
  const [orderType, setOrderType] = useState("IN"); // IN(매장), OUT(포장)
  const [isLoading, setIsLoading] = useState(false); // 주문 처리 로딩

  // 장바구니: { menuId, qty }
  const [cartItems, setCartItems] = useState([]);
  // 화면에서 보여줄 메뉴 카테고리: ALL / BEVERAGE / DESSERT
  const [activeTab, setActiveTab] = useState("ALL");

  // 구독권별 메뉴 리스트
  const [beverageMenus, setBeverageMenus] = useState([]);
  const [dessertMenus, setDessertMenus] = useState([]);
  const [allMenus, setAllMenus] = useState([]);

  // 1. 보유 구독권 목록 조회 + 기본 선택
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchUserSubscriptions();
        const list = res || [];
        setInventoryList(list);

        let defaultInventory = null;

        // 1) 주문하기 버튼 눌렀을 때 넘어온 구독권이 있으면 그걸 우선
        if (subscription?.memberSubscriptionId) {
          defaultInventory = list.find(
            (it) =>
              Number(it.memberSubscriptionId) ===
              Number(subscription.memberSubscriptionId)
          );
        }

        // 2) 없으면 남은 잔수 > 0 인 구독권 중 첫 번째
        if (!defaultInventory) {
          defaultInventory =
            list.find((it) => it.remainingCount > 0) || list[0] || null;
        }

        setSelectedInventory(defaultInventory || null);
      } catch (err) {
        console.error("구독권 목록 조회 실패: ", err);

        // 실패 시 더미 데이터 사용
        setInventoryList(subList);
        let defaultInventory = null;

        if (subscription?.memberSubscriptionId) {
          defaultInventory = subList.find(
            (it) =>
              Number(it.memberSubscriptionId) ===
              Number(subscription.memberSubscriptionId)
          );
        } else if (subList.length > 0) {
          defaultInventory = subList[0];
        }

        setSelectedInventory(defaultInventory || null);
      }
    })();
  }, [subscription]);

  // 2. 구독권이 바뀔 때마다 장바구니/탭/메뉴 목록 리셋 + 재계산
  useEffect(() => {
    setCartItems([]);
    setActiveTab("ALL");

    const rawMenu = selectedInventory?.menu;

    if (!rawMenu) {
      setBeverageMenus([]);
      setDessertMenus([]);
      setAllMenus([]);
      return;
    }

    let beverages = [];
    let desserts = [];

    if (Array.isArray(rawMenu)) {
      beverages = rawMenu.filter((m) => m.menuType === "BEVERAGE");
      desserts = rawMenu.filter((m) => m.menuType === "DESSERT");
    } else if (rawMenu.menusByType) {
      beverages = rawMenu.menusByType.BEVERAGE || [];
      desserts = rawMenu.menusByType.DESSERT || [];
    }

    setBeverageMenus(beverages);
    setDessertMenus(desserts);
    setAllMenus([...beverages, ...desserts]);
  }, [selectedInventory]);

  // 메뉴 id → 정보 맵
  const menuMap = useMemo(() => {
    const map = {};
    allMenus.forEach((m) => {
      map[m.menuId] = m;
    });
    return map;
  }, [allMenus]);

  // 음료 필수
  const requiredTypes = ["BEVERAGE"];

  const hasBeverageInCart = useMemo(
    () =>
      cartItems.some((ci) => beverageMenus.some((b) => b.menuId === ci.menuId)),
    [cartItems, beverageMenus]
  );

  // 구독권 선택
  function handleSelectInventory(memberSubscriptionId) {
    const realId = Number(memberSubscriptionId);

    const targetInventory = inventoryList.find(
      (it) => Number(it.memberSubscriptionId) === realId
    );

    if (!targetInventory) {
      console.warn("선택한 구독권을 찾을 수 없습니다.");
      return;
    }

    if (targetInventory.remainingCount <= 0) {
      alert("해당 구독권은 남은 잔수가 없어 주문할 수 없습니다.");
      return;
    }

    setSelectedInventory(targetInventory);
  }

  // 장바구니 추가
  function handleAddToCart(menuId) {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuId === menuId);
      if (existing) {
        return prev.map((ci) =>
          ci.menuId === menuId ? { ...ci, qty: ci.qty + 1 } : ci
        );
      }
      return [...prev, { menuId, qty: 1 }];
    });
  }

  // 장바구니 수량 감소
  function handleDecreaseFromCart(menuId) {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuId === menuId);
      if (!existing) return prev;
      if (existing.qty <= 1) {
        return prev.filter((ci) => ci.menuId !== menuId);
      }
      return prev.map((ci) =>
        ci.menuId === menuId ? { ...ci, qty: ci.qty - 1 } : ci
      );
    });
  }

  // 장바구니에서 완전 삭제
  function handleRemoveItem(menuId) {
    setCartItems((prev) => prev.filter((ci) => ci.menuId !== menuId));
  }

  // 장바구니 + 메뉴 정보
  const cartWithInfo = useMemo(
    () =>
      cartItems.map((ci) => ({
        ...ci,
        menu: menuMap[ci.menuId],
      })),
    [cartItems, menuMap]
  );

  const subtotal = useMemo(
    () =>
      cartWithInfo.reduce(
        (sum, item) => sum + (item.menu?.price || 0) * item.qty,
        0
      ),
    [cartWithInfo]
  );

  // 화면에 보여줄 메뉴 리스트 (탭 필터)
  const visibleMenus = useMemo(() => {
    if (activeTab === "BEVERAGE") return beverageMenus;
    if (activeTab === "DESSERT") return dessertMenus;
    return allMenus;
  }, [activeTab, beverageMenus, dessertMenus, allMenus]);

  // 실제 API에 보낼 menu 배열 (menuId + count)
  function buildBackendMenu() {
    return cartItems.map((ci) => ({
      menuId: ci.menuId,
      count: ci.qty,
    }));
  }

  // 최종 주문 요청
  async function requestOrder() {
    console.log(authUser);
    if (!authUser?.memberId) {
      alert("로그인 정보가 없습니다. 다시 로그인해 주세요.");
      return;
    }

    if (!selectedInventory) {
      alert("구독권을 선택해주세요.");
      return;
    }

    const selectedSub = selectedInventory;
    const storeId =
      selectedSub.store?.partnerStoreId ||
      selectedSub.store?.storeId ||
      selectedSub.storeId;
    const memberSubscriptionId = selectedSub.memberSubscriptionId;

    if (!storeId) {
      alert("주문할 매장 정보를 찾을 수 없습니다.");
      return;
    }

    const menu = buildBackendMenu();

    if (menu.length === 0) {
      alert("주문할 메뉴를 선택해 주세요.");
      return;
    }

    // 음료 최소 1개 선택 필수
    if (requiredTypes.includes("BEVERAGE") && !hasBeverageInCart) {
      alert("음료는 최소 1잔 선택해야 합니다.");
      return;
    }

    const orderPayload = {
      memberId: authUser.memberId,
      storeId,
      memberSubscriptionId,
      orderType,
      menu,
    };

    try {
      setIsLoading(true);
      console.log("주문 요청 >> ", orderPayload);

      const res = await requestNewOrder(orderPayload);

      // API 응답 구조: { success, data, message }
      const { data, message, success } = res;

      console.log(data, message, success);

      // 서버에서 에러 메시지가 왔다면 경고 표시하고 종료
      if (message && !success) {
        alert(message || "주문 처리 중 오류가 발생했습니다.");
        return;
      }

      const orderId = data?.orderId;

      if (orderId) {
        navigate(`/me/order/${orderId}`);
      } else {
        alert("주문 정보를 불러올 수 없습니다.");
        navigate(-1);
      }
    } catch (err) {
      console.error("주문 요청 실패: ", err);
      alert("주문에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsLoading(false);
    }
  }

  // 뒤로가기
  function handleBack() {
    navigate(-1);
  }

  return (
    <Box sx={{ px: isAppLike ? 2 : 6, py: 3, pb: 10 }}>
      {/* 상단 헤더 */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant={isAppLike ? "h6" : "h5"} fontWeight="bold">
          주문하기
        </Typography>
      </Box>

      {/* 구독권 & 이용 타입 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
          alignItems: { xs: "stretch", md: "stretch" },
        }}
      >
        <Box sx={{ flex: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
            주문 매장
          </Typography>
          <Select
            id="order-target-store"
            value={selectedInventory?.memberSubscriptionId || ""}
            onChange={(e) => handleSelectInventory(e.target.value)}
            fullWidth
            displayEmpty
          >
            {inventoryList.length === 0 && (
              <MenuItem value="">
                <em>사용 가능한 구독권이 없습니다.</em>
              </MenuItem>
            )}
            {inventoryList.map((inventory) => (
              <MenuItem
                key={inventory.memberSubscriptionId}
                value={inventory.memberSubscriptionId}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Avatar
                    src={menuDummy || inventory.store?.storeImg || menuDummy}
                    alt={inventory.store?.storeName}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = menuDummy;
                    }}
                  />
                  <Box>
                    <Typography variant="body2">
                      {inventory.store?.storeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {inventory.subName}
                      {typeof inventory.remainingCount === "number"
                        ? ` · 남은잔 ${inventory.remainingCount}잔`
                        : null}
                      {inventory.isGift === "Y"
                        ? ` 🎁 ${inventory.sender}님에게 받은 선물`
                        : ""}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600 }}>
            이용 타입
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={orderType}
            exclusive
            onChange={(e, v) => v && setOrderType(v)}
            aria-label="order-type"
            sx={{
              width: "100%",
              height: 74,
              "& .MuiToggleButton-root": {
                flex: 1,
                height: "100%",
                borderRadius: 0,
              },
            }}
          >
            <ToggleButton value="IN">매장</ToggleButton>
            <ToggleButton value="OUT">포장</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* 본문: 메뉴 그리드 + 장바구니 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "flex-start",
        }}
      >
        {/* 메뉴 그리드 영역 */}

        <Box sx={{ flex: 3, width: "100%" }}>
          {/* 카테고리 탭 */}
          <ToggleButtonGroup
            color="primary"
            value={activeTab}
            exclusive
            onChange={(e, v) => v && setActiveTab(v)}
            sx={{
              mb: 2,
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                px: 2,
              },
            }}
          >
            <ToggleButton value="ALL">전체</ToggleButton>
            <ToggleButton value="BEVERAGE">음료</ToggleButton>
            <ToggleButton value="DESSERT">디저트</ToggleButton>
          </ToggleButtonGroup>

          {/* 메뉴 카드 그리드 */}
          {visibleMenus.length === 0 ? (
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                선택한 구독권에서 주문 가능한 메뉴가 없습니다.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(3, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {visibleMenus.map((menu) => {
                const cartItem = cartItems.find(
                  (ci) => ci.menuId === menu.menuId
                );
                const isBeverage = menu.menuType === "BEVERAGE";

                return (
                  <Box
                    key={menu.menuId}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "white",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      height: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        pb: "75%",
                        position: "relative",
                        borderRadius: 2,
                        overflow: "hidden",
                        mb: 1.5,
                      }}
                    >
                      <Box
                        component="img"
                        src={menuDummy || menu.menuImg || menuDummy}
                        alt={menu.menuName || menu.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = menuDummy;
                        }}
                        sx={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.5 }}
                    >
                      {menu.menuName || menu.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {menu.price.toLocaleString()}원
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 1, flexGrow: 1 }}
                    >
                      {isBeverage ? "음료" : "디저트"}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        mt: "auto",
                      }}
                    >
                      {cartItem ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleDecreaseFromCart(menu.menuId)}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography>{cartItem.qty}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleAddToCart(menu.menuId)}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddToCart(menu.menuId)}
                          sx={{
                            borderRadius: 999,
                            textTransform: "none",
                            fontSize: "0.8rem",
                          }}
                        >
                          담기
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>

        {/* 장바구니 영역 */}
        <Box
          sx={{
            flex: 2,
            minWidth: { xs: "100%", md: 260 },
            maxWidth: { md: 360 },
          }}
        >
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
              p: 2.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <ShoppingCartIcon />
                <Typography fontWeight="bold">주문 내역</Typography>
              </Box>
              {cartItems.length > 0 && (
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setCartItems([])}
                  sx={{ textTransform: "none", fontSize: "0.75rem" }}
                >
                  전체 비우기
                </Button>
              )}
            </Box>

            {cartWithInfo.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                장바구니에 담긴 메뉴가 없습니다.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {cartWithInfo.map((item) => (
                  <Box
                    key={item.menuId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.menu?.menuName || item.menu?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(item.menu?.price || 0).toLocaleString()}원
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleDecreaseFromCart(item.menuId)}
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography variant="body2">{item.qty}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleAddToCart(item.menuId)}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(item.menuId)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Box sx={{ borderTop: "1px solid #eee", mt: 2, pt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      합계
                    </Typography>
                    <Typography fontWeight="bold">
                      {subtotal.toLocaleString()}원
                    </Typography>
                  </Box>
                  {requiredTypes.includes("BEVERAGE") && !hasBeverageInCart && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      음료를 최소 1잔 이상 선택해야 주문이 가능합니다.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                bgcolor: "black",
                "&:hover": { bgcolor: "#222" },
                textTransform: "none",
              }}
              onClick={requestOrder}
              disabled={
                isLoading || cartItems.length === 0 || !hasBeverageInCart
              }
            >
              {isLoading ? (
                <CircularProgress size={18} sx={{ color: "white" }} />
              ) : (
                "주문하기"
              )}
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 주문 처리 중 Backdrop */}
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
