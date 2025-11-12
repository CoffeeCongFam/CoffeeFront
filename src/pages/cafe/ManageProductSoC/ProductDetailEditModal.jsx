import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	Typography,
	Divider,
} from "@mui/material";

const modalStyle = {
	"& .MuiDialog-paper": {
		width: "100%",
		maxWidth: 600,
		borderRadius: 2,
	},
};

const ProductDetailEditModal = ({ open, subscription, onClose, onSave }) => {
	const [formData, setFormData] = useState(subscription);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [isUpdatable, setIsUpdatable] = useState(true);

	const formatDateTime = (isoString) => {
		if (!isoString) return "아직 구매한 사람이 없음";

		try {
			// ISO 문자열을 Date 객체로
			const date = new Date(isoString);

			// 날짜 (년-월-일) 포맷 설정
			const dateOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
			const datePart = new Intl.DateTimeFormat("ko-KR", dateOptions).format(
				date
			);

			// 시간(오전/오후 시:분)
			const timeOptions = { hour: "numeric", minute: "2-digit", hour12: true };
			const timePart = new Intl.DateTimeFormat("ko-KR", timeOptions).format(
				date
			);

			// 두 부분을 합쳐서
			return `${datePart.replace(/\. /g, "-").replace(/\.$/, "")} ${timePart}`;
		} catch (e) {
			console.error("날짜 포맷 오류 :", e);
			return isoString;
		}
	};

	// 구독권 상태 변경이 가능 한지 여부
	useEffect(() => {
		if (subscription) {
			setFormData(subscription);

			// expired 기준으로 isUpdatable 계산
			const checkUpdatable = () => {
				// expired 값이 null이면, 언제든지 수정 가능 true
				if (!subscription.expiredAt) {
					return true;
				}

				const expiredDate = new Date(subscription.expiredAt);
				const now = new Date();

				// expiredAt이 유효한 날짜가 아니면, 기본적으로 false 처리하거나,
				// 2. expiredAt이 유효한 날짜가 아니면 (파싱 오류 등) 기본적으로 false 처리하거나,
				// 현재는 안전하게 true로 가정하고 넘어갑니다. (백엔드 데이터 신뢰 가정)
				if (isNaN(expiredDate.getTime())) {
					console.warn(
						"ExpiredAt 날짜 형식이 유효하지 않습니다:",
						subscription.expiredAt
					);
					return true; // 안전하게 true를 반환하거나 false로 설정할 수 있습니다.
				}

				// 3. expiredAt이 현재 시간보다 미래면 (아직 기간이 안 지남) 수정 불가능 (false)
				// expiredDate > now : 미래
				if (expiredDate.getTime() > now.getTime()) {
					return false;
				}

				// 4. expiredAt이 현재 시간보다 과거 시간이면 수정 가능 (true)
				// expiredDate <= now : 과거 또는 현재
				return true;
			};

			const result = checkUpdatable();
			setIsUpdatable(result);

			// console.log('--- 현재 구독권 데이터 (디버깅) ---');
			// console.log('expiredAt 값:', subscription.expiredAt);
			// console.log('계산된 isUpdatable 값:', result); // ⬅️ 계산 결과 확인
			// console.log('------------------------------------');
		}
	}, [subscription]); // subscription 객체가 바뀔 때마다 재계산

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async () => {
		setIsSubmitting(true);
		const dataToSend = { subscriptionStatus: formData.subscriptionStatus };
		await onSave(subscription.subscriptionId, dataToSend);
		setIsSubmitting(false);
	};

	const InfoBox = ({ title, content, subContent = null }) => (
		<Box
			sx={{
				flexGrow: 1,
				padding: 1,
				backgroundColor: "#FFFFFF",
				borderRadius: "8px",
				minHeight: "64px",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				border: "1px solid #E0E0E0",
			}}
		>
			<Typography
				variant='caption'
				color='textSecondary'
				fontWeight='bold'
				sx={{ mb: 0.25 }}
			>
				{title}
			</Typography>
			<Typography variant='body2' fontWeight='bold'>
				{content}
			</Typography>
			{subContent && (
				<Typography variant='caption' color='error' sx={{ mt: 0.5 }}>
					{subContent}
				</Typography>
			)}
		</Box>
	);

	if (!subscription) return null;

	return (
		<Dialog open={open} onClose={onClose} sx={modalStyle} fullWidth>
			<DialogTitle sx={{ fontWeight: "bold" }}>구독권 상세 정보</DialogTitle>
			<DialogContent dividers>
				<Box display='flex' flexDirection='column' gap={2}>
					{/* 이미지 */}
					<Box textAlign='center'>
						{subscription.subscriptionImg ? (
							<img
								src={subscription.subscriptionImg}
								alt='구독 이미지'
								style={{
									width: "100%",
									height: 160,
									objectFit: "cover",
									borderRadius: 8,
								}}
							/>
						) : (
							<Typography color='text.disabled' sx={{ py: 2 }}>
								이미지가 없습니다.
							</Typography>
						)}
					</Box>

					<Divider />

					{/* 구독권 메타 정보 (텍스트로 표시) */}
					<Box>
						<Box sx={{ mb: 1 }} variant='body1'>
							<InfoBox title='이름' content={subscription.subscriptionName} />
						</Box>
						<Box sx={{ display: "flex", gap: 1, mt: 1, mb: 1 }} variant='body1'>
							<InfoBox
								title='구독권 유형'
								content={subscription.subscriptionType}
							/>
							<InfoBox
								title='가격'
								content={subscription.price?.toLocaleString() + "원"}
							/>
						</Box>
						<Box sx={{ mb: 1 }} variant='body1'>
							<InfoBox
								title='설명'
								content={subscription.subscriptionDesc || "없음"}
							/>
						</Box>
						<Box sx={{ display: "flex", gap: 1, mt: 1 }} variant='body1'>
							<InfoBox
								title='구독 기간'
								content={subscription.subscriptionPeriod + "일"}
							/>
							<InfoBox
								title='일일 최대 사용 횟수'
								content={subscription.maxDailyUsage + "회"}
							/>
							<InfoBox
								title='남은 판매 수량'
								content={
									subscription.remainSalesQuantity +
									" / " +
									subscription.salesLimitQuantity
								}
							/>
						</Box>
					</Box>

					<Divider />

					{/* 판매 상태만 수정 가능 */}
					<FormControl fullWidth>
						<InputLabel>판매 상태</InputLabel>
						<Select
							label='판매 상태'
							name='subscriptionStatus'
							value={formData.subscriptionStatus || ""}
							onChange={handleChange}
							// 구독권 상태 변경이 허용되지 않은 경우 비활성화
						>
							<MenuItem value='ONSALE'>판매 중</MenuItem>
							<MenuItem value='SOLDOUT'>품절</MenuItem>
							<MenuItem value='SUSPENDED'>판매 중지</MenuItem>
						</Select>
					</FormControl>
				</Box>
			</DialogContent>

			<DialogActions sx={{ p: 3 }}>
				<DialogActions sx={{ p: 3 }}>
					<Box>
						<Button
							onClick={onClose}
							disabled={isSubmitting}
							sx={{ mr: 1, color: "#334336" }}
						>
							닫기
						</Button>
						<Button
							onClick={handleSubmit}
							disabled={
								isSubmitting // 저장 중이면 무조건 비활성화
							} // 저장중 or 상태 변경 가능한지
							variant='contained'
							sx={{
								bgcolor: "#334336",
								color: "#fff9f4",
								"&:hover": {
									bgcolor: "#334336",
									opacity: 0.9,
								},
								"&:disabled": {
									bgcolor: "#ccc",
									color: "#666",
								},
							}}
						>
							{isSubmitting ? "저장 중..." : "판매 상태 수정"}
						</Button>
					</Box>
				</DialogActions>
			</DialogActions>
		</Dialog>
	);
};

export default ProductDetailEditModal;
