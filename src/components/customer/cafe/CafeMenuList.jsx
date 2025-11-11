import React, { useMemo, useState } from "react";
import { Box, Typography, IconButton, Avatar } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import menuDummy from "../../../assets/menuDummy.jpg";
import CoffeeIcon from "@mui/icons-material/Coffee";
import CakeIcon from "@mui/icons-material/Cake";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

function CafeMenuList({ menus = [] }) {
  // 1. 타입별 그룹핑
  const grouped = useMemo(() => {
    const result = {};
    menus.forEach((m) => {
      const type = m.menuType || "ETC";
      if (!result[type]) result[type] = [];
      result[type].push(m);
    });
    return result;
  }, [menus]);

  // 2. 열림/닫힘 상태 관리 (타입별)
  const [openState, setOpenState] = useState(() => {
    const init = {};
    Object.keys(grouped).forEach((t) => {
      init[t] = true; // 처음에는 다 열려 있게
    });
    return init;
  });

  const toggleSection = (type) => {
    setOpenState((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  // 타입 표시 예쁘게
  const getTypeLabel = (type) => {
    if (type === "BEVERAGE") return "음료";
    if (type === "DESSERT") return "디저트";
    return type;
  };

  return (
    <Box>
      {Object.keys(grouped).length === 0 ? (
        <Typography variant="body2" sx={{ color: "#334336" }}>
          등록된 메뉴가 없습니다.
        </Typography>
      ) : (
        Object.keys(grouped).map((type) => (
          <Box
            key={type}
            sx={{
              mb: 2,
              border: "1px solid #ffe0b2",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {/* 섹션 헤더 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.2,
                bgcolor: "#fff9f4",
                cursor: "pointer",
              }}
              onClick={() => toggleSection(type)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#334336" }}>
                {getTypeLabel(type)}
                <Typography
                  component="span"
                  sx={{ fontSize: 13, color: "#334336", ml: 0.5 }}
                >
                  ({grouped[type].length})
                </Typography>
              </Typography>
              <IconButton size="small" sx={{ color: "#334336" }}>
                {openState[type] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>

            {/* 메뉴 목록 */}
            {openState[type] && (
              <Box sx={{ px: 2, pb: 1 }}>
                {grouped[type].map((menu) => (
                  <Box
                    key={menu.menuId || menu.id || menu.menuName || menu.name}
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      gap: { xs: 1.5, sm: 2 },
                      alignItems: { xs: "stretch", sm: "center" },
                      py: 1.2,
                      borderBottom: "1px solid #ffe0b2",
                      "&:last-of-type": { borderBottom: "none" },
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#fff9f4",
                      },
                    }}
                  >
                    {/* 왼쪽: 이미지 + 이름/설명 */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: 2,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {
                        menu?.menuImg ? (
                          <Box
                            component="img"
                            src={menuDummy || menu.menuImg}
                            alt={menu.menuName}
                            sx={{
                              width: { xs: 80, sm: 100 },
                              height: { xs: 64, sm: 70 },
                              objectFit: "cover",
                              borderRadius: 1.2,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: { xs: 80, sm: 100 },
                              height: { xs: 64, sm: 70 },
                              bgcolor: "#334336",
                              color: "#fff9f4",
                              borderRadius: 1.2, // 박스 모양 맞추기
                              flexShrink: 0,
                            }}
                          >
                            {menu.menuType === "DESSERT" ? (
                              <CakeIcon sx={{ fontSize: 36 }} />
                            ) : (
                              <CoffeeIcon sx={{ fontSize: 36 }} />
                            )}
                          </Avatar>
                        )
                      }

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 500, wordBreak: "keep-all", color: "#334336" }}
                        >
                          {menu.menuName || menu.name}
                        </Typography>
                        {menu.menuDesc && (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.3,
                              display: { xs: "block", sm: "block" },
                              whiteSpace: "normal",
                              color: "#334336",
                            }}
                          >
                            {menu.menuDesc}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* 오른쪽: 가격 / 상태 */}
                    <Box
                      sx={{
                        width: { xs: "100%", sm: "auto" },
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: { xs: "flex-end", sm: "flex-start" },
                        gap: 1,
                        ml: { sm: 2 },
                      }}
                    >
                      {/* 비활성 메뉴 표시 */}
                      {menu.menuStatus === "N" && (
                        <Typography variant="caption" color="error">
                          판매중단
                        </Typography>
                      )}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          color: "#334336",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {menu.price ? menu.price.toLocaleString() : 0}원
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        ))
      )}
    </Box>
  );
}

export default CafeMenuList;
