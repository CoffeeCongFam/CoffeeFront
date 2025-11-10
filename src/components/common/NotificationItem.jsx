// src/components/common/NotificationItem.jsx
import {
  ListItemButton,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import CoffeeIcon from "@mui/icons-material/Coffee";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

// 타입에 따라 아이콘 선택
function getNotificationIcon(type) {
  switch (type) {
    case "주문":
      return <ShoppingCartIcon />;
    case "선물":
      return <CardGiftcardIcon />;
    default:
      return <CoffeeIcon />;
  }
}

function formatDateTime(isoString) {
  if (!isoString) return "";
  const [date, timeWithMs] = isoString.split("T");
  const time = timeWithMs?.split(".")[0] ?? "";
  return `${date} ${time}`;
}

export default function NotificationItem({ noti, onClick, onDelete }) {
  const isRead = !!(noti.readAt || noti.isRead);

  let messageText = "";
  if (noti.notificationContent) {
    if (typeof noti.notificationContent === "object") {
      messageText = noti.notificationContent.message ?? "";
    } else {
      // 혹시 문자열로 올 경우
      messageText = String(noti.notificationContent);
    }
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // 리스트 전체 클릭 막기
    if (onDelete) onDelete(noti.notificationId);
  };

  const handleClick = () => {
    if (noti.readAt !== "") {
      console.log("이미 읽은 알림");
      onClick(noti);
    } else {
      onClick(noti);
    }
    // if (onClick) onClick(noti);
  };

  return (
    <ListItemButton alignItems="flex-start" onClick={handleClick}>
      <ListItemAvatar>
        <Avatar
          sx={{
            backgroundColor: isRead ? "rgba(223, 223, 223, 1)" : "brown",
          }}
        >
          {getNotificationIcon(noti.notificationType)}
        </Avatar>
      </ListItemAvatar>
      <Box sx={{ ml: 1, width: "100%" }}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 0.5, flexGrow: 1 }}
          >
            {noti.notificationType}
          </Typography>
          <IconButton
            aria-label="delete"
            size="small"
            sx={{ zIndex: 1900 }}
            onClick={handleDeleteClick}
          >
            <ClearRoundedIcon fontSize="inherit" />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.3 }}>
          {messageText}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {formatDateTime(noti.createdAt)}
        </Typography>
      </Box>
    </ListItemButton>
  );
}
