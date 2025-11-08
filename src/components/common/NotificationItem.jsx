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

export default function NotificationItem({ noti, onClick }) {
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

  const handleClick = () => {
    if (onClick) onClick(noti); // 👈 전체 알림 객체 전달
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
      <Box sx={{ ml: 1 }}>
        <IconButton aria-label="delete" size="small">
          <ClearRoundedIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {noti.notificationType}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.3 }}>
          {messageText}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {formatDateTime(noti.createdAT)}
        </Typography>
      </Box>
    </ListItemButton>
  );
}
