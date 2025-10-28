import {
	Card,
	CardContent,
	Typography,
	Box,
	Chip,
	Button,
} from "@mui/material";

import { ImageNotSupported } from "@mui/icons-material";

const SubscriptionCard = ({ item }) => {
	return (
		<Box sx={{ p: 1 }}>
			<Card
				sx={{
					p: 2,
					borderRadius: 1,
					boxShadow: 3,
					transition: "transform 0.2s",
					"&:hover": { transform: "scale(1.03)" },
				}}
			>
				<CardContent>
					{/* 이미지 */}
					<Box
						sx={{
							width: "100%",
							height: 120, // 이미지 영역 높이
							mb: 1,
							borderRadius: 1,
							backgroundColor: item.imageUrl ? "transparent" : "#f0f0f0",
							overflow: "hidden",
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{item.imageUrl ? (
							<img
								src={item.imageUrl}
								alt={item.storeName}
								style={{ width: "100%", height: "100%", objectFit: "cover" }}
							/>
						) : (
							<ImageNotSupported sx={{ fontSize: 48, color: "#aaa" }} />
						)}
					</Box>

					{/* 매장 이름 + 구독 타입 뱃지 */}
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
						}}
					>
						<Typography variant='h6' sx={{ fontWeight: 600 }}>
							{item.storeName}
						</Typography>

						<Chip
							label={
								item.subscriptionType === "B"
									? "베이직"
									: item.subscriptionType === "S"
									? "스탠다드"
									: "프리미엄"
							}
							sx={{
								backgroundColor: "black",
								color: "white",
								fontWeight: 600,
								fontSize: "0.9rem",
								borderRadius: "8px",
								px: 1.5,
								height: 24,
							}}
						/>
					</Box>

					{/* 구독 기간 및 남은 일수 */}
					<Box
						sx={{
							display: "flex",
							flexDirection: "column",
							alignItems: "flex-end",
							mt: 1,
						}}
					>
						<Typography variant='body2' color='text.secondary'>
							{item.subscriptionStart} ~ {item.subscriptionEnd}
						</Typography>

						<Typography variant='body2' color='deeppink'>
							남은 일수: {getRemainingDays(item.subscriptionEnd)}일
						</Typography>
					</Box>

					{/* 버튼 */}
					<Button
						variant='contained'
						sx={{
							backgroundColor: "black",
							color: "white",
							"&:hover": { backgroundColor: "#333" },
							mt: 3,
							width: "100%",
						}}
						disabled={item.remainingDailyCount <= 0}
					>
						{item.remainingDailyCount > 0 ? "주문하기" : "오늘 이용 완료"}
					</Button>
				</CardContent>
			</Card>
		</Box>
	);
};

function getRemainingDays(endStr) {
	if (!endStr) return "-";

	const [y, m, d] = endStr.split(".").map(Number);
	const endDate = new Date(y, m - 1, d);
	const today = new Date();

	today.setHours(0, 0, 0, 0);

	const diff = (endDate - today) / (1000 * 60 * 60 * 24);

	return Math.max(Math.ceil(diff), 0);
}

export default SubscriptionCard;
