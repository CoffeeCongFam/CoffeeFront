import { Typography, Box } from "@mui/material";
import Slider from "react-slick";
import SubscriptionCard from "../../components/SubscriptionCard";

/* TODO: 하드코딩 변수 API 호출로 전환하기 */
const memberName = "유저";
const products = [
	{
		productType: "S",
		subscriptionPeriod: 30,
		subscriptionType: "B",
		subscriptionStart: "2025.10.25",
		subscriptionEnd: "2025.11.25",
		storeName: "카페 이름",
		remainingDailyCount: 3,
	},
	{
		productName: "기프티콘 이름 1",
		productType: "G",
		subscriptionPeriod: 30,
		storeName: "커피콩 카페",
	},
	{
		productType: "S",
		subscriptionPeriod: 60,
		subscriptionType: "S",
		subscriptionStart: "2025.10.25",
		subscriptionEnd: "2025.11.25",
		storeName: "카페 이름",
		remainingDailyCount: 0,
	},
	{
		productName: "기프티콘 이름 2",
		productType: "G",
		subscriptionPeriod: 15,
		storeName: "카페라떼",
	},
	{
		productType: "S",
		subscriptionPeriod: 90,
		subscriptionType: "P",
		subscriptionStart: "2025.10.25",
		subscriptionEnd: "2025.11.25",
		storeName: "카페 이름",
		remainingDailyCount: 1,
	},
	{
		productType: "S",
		subscriptionPeriod: 90,
		subscriptionType: "P",
		subscriptionStart: "2025.10.25",
		subscriptionEnd: "2025.11.25",
		storeName: "카페 이름",
		remainingDailyCount: 1,
	},
	{
		productName: "기프티콘 이름 3",
		productType: "G",
		subscriptionPeriod: 7,
		storeName: "커피빈",
	},
];

function CustomerHome() {
	const settings = {
		dots: false,
		infinite: false,
		speed: 500,
		slidesToShow: 3,
		slidesToScroll: 1,
		arrows: true,
		responsive: [
			{
				breakpoint: 600,
				settings: { slidesToShow: 1 },
			},
		],
	};

	return (
		<Box sx={{ p: 2 }}>
			<Typography variant='h5' component='h2' sx={{ fontWeight: 600 }}>
				<Box component='span' sx={{ color: "deeppink" }}>
					{memberName}
				</Box>{" "}
				님, 오늘도 한 잔의 여유를 즐겨보세요.
			</Typography>
			<Typography variant='body1' sx={{ mt: 2 }}>
				오늘은 어디에서 커피 한 잔 할까요?
			</Typography>

			<Box
				sx={{ maxWidth: 900, mx: "auto", mt: 4, backgroundColor: "lightgray" }}
			>
				<Slider {...settings}>
					{products
						.filter((item) => item.productType === "S")
						.map((item, idx) => (
							<SubscriptionCard key={idx} item={item} />
						))}
				</Slider>
			</Box>
		</Box>
	);
}

export default CustomerHome;
