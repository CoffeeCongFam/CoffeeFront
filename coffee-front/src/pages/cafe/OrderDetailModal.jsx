import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // 닫기 아이콘

// 모달 컴포넌트 - 상세 정보 확인, 접수거절 버튼, 거절 사유 입력 폼이 있음

const DetailField = ({ label, value, isState = false }) => {
  let content;

  if (isState) {
    // 주문 상태 필드인 경우 (객체 전달됨): value.name을 렌더링
    content = (
      <Typography
        sx={{
          // ⭐ 레이블과의 간격 조정을 위해 mt를 제거하고 ml을 추가 ⭐
          ml: 1,
          bgcolor: value.header,
          color: 'white',
          p: '2px 8px',
          borderRadius: 1,
          fontWeight: 'bold',
        }}
      >
        {value.name} {/* 🌟 객체에서 문자열(name)만 사용 🌟 */}
      </Typography>
    );
  } else {
    // 일반 필드인 경우 (문자열/숫자 전달 예상)
    // 🌟 방어 코드: value가 null/undefined/객체가 아닐 때만 렌더링 🌟
    const isRenderable = value !== null && typeof value !== 'object';
    content = (
      <Typography sx={{ ml: 1 }}>
        {isRenderable ? value : '데이터 없음'}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
      <Typography
        variant="body2"
        sx={{ width: 80, color: 'text.secondary', fontWeight: 'bold' }}
      >
        {label} :
      </Typography>
      {content}
    </Box>
  );
};

export default function OrderDetailModal({
  open,
  onClose,
  order,
  statusColors,
  onReject,
}) {
  // 주문 상세 및 거절 처리 모달
  // order 객체가 없으면 렌더링하지 않음
  if (!order) return null;

  const statusInfo = statusColors[order.status];

  // 접수 거절 버튼은 REQUEST, INPROGRESS 상태일 때만 표시
  const showRejectBtn = order.status === 'REQUEST';

  // 거절 버튼 클릭 핸들러 : 부모로부터 전달받은 onReject 함수를 호출하고 모달을 닫는다.
  const handleReject = () => {
    onReject(order.id, 'REJECTED');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#424242',
          color: 'white',
          p: 2,
        }}
      >
        <Typography fontWeight="bold">주문 상세내역</Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        {/* A01 주문 번호 및 타입 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              border: '1px solid #9e9e9e',
              p: 1,
              mr: 2,
              width: 70,
              height: 40,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body1" fontWeight="bold">
              A01
            </Typography>
          </Box>
          <Typography variant="h6" fontWeight="bold">
            {order.type}
          </Typography>
        </Box>

        {/* 상세 정보 필드 */}
        <DetailField label="주문일시" value={order.time} />
        <DetailField label="주문자" value="커피빵커피커피" />
        <DetailField label="전화번호" value="010-1111-1111" />
        <DetailField label="주문상태" value={statusInfo} isStatus={true} />

        {/* 메뉴 및 수량 영역 */}
        <Box sx={{ mt: 3, borderTop: '1px solid #eee', pt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              메뉴
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              수량
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">{order.menu.split('(')[0]}</Typography>
            <Typography variant="body2">
              {order.menu.match(/\((\d+)\)/)
                ? order.menu.match(/\((\d+)\)/)[1]
                : 1}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      {/* 하단 버튼 영역 */}
      <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
        {showRejectBtn && (
          
          <Button
            fullWidth
            variant="contained"
            // 🌟 거절 버튼 클릭 시 handleReject 호출
            onClick={handleReject}
            sx={{ bgcolor: '#424242', '&:hover': { bgcolor: '#212121' } }}
          >
            접수 거절
          </Button>
        )}
      </Box>
    </Dialog>
  );
}
