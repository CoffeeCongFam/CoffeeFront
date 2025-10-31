import React, { useMemo, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    if (type === "DESERT") return "디저트";
    return type;
  };

  return (
    <Box>
      {Object.keys(grouped).length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          등록된 메뉴가 없습니다.
        </Typography>
      ) : (
        Object.keys(grouped).map((type) => (
          <Box
            key={type}
            sx={{ mb: 2, border: "1px solid #eee", borderRadius: 1 }}
          >
            {/* 섹션 헤더 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.2,
                bgcolor: "#fafafa",
                cursor: "pointer",
              }}
              onClick={() => toggleSection(type)}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {getTypeLabel(type)}
              </Typography>
              <IconButton size="small">
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                      borderBottom: "1px solid #f0f0f0",
                      "&:last-of-type": { borderBottom: "none" },
                      cursor: "pointer",
                      transition: "background-color 0.2s ease", // 부드럽게 색 전환
                      "&:hover": {
                        backgroundColor: "#f9f9f9", // ✅ hover 시 연한 회색 배경
                      },
                    }}
                  >
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <img
                        src={menu.menuImage}
                        alt={menu.menuName}
                        style={{
                          width: "100px",
                          height: "70px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                      />

                      <Box>
                        <Typography variant="subtitle1">
                          {menu.menuName || menu.name}
                        </Typography>
                        {menu.description && (
                          <Typography variant="body2" color="text.secondary">
                            {menu.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Box
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {/* 비활성 메뉴 표시 */}
                      {menu.isActive === false && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ display: "block" }}
                        >
                          판매중단
                        </Typography>
                      )}
                      <Typography variant="subtitle1">
                        {menu.price ? menu.price.toLocaleString() : "-"}원
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
