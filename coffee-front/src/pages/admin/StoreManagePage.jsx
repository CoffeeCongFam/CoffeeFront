import React, { useState } from 'react';
import { Box, Table } from '@mui/material';
import StoreSearchFilter from './adminComponents/StoreSearchFilter'; // 경로에 맞게 수정
import StoreActions from './adminComponents/StoreActions'; // 경로에 맞게 수정
import { useNavigate } from 'react-router-dom';

// 임시 데이터**(실제로는 api에서)
const dummy_stores = [
  {
    id: 'C000001',
    email: 'test1@cafe.com',
    bizNo: '123-45-67890',
    name: '달빛다방',
    roadAddress: '서울 종로구 삼청로 111-1',
    detailAddress: '3층 301호',
    info: '감성적인 분위기...',
    approvedDate: '2025-10-26',
    status: 'ACTIVE',
  },
  {
    id: 'C000002',
    email: 'test2@tea.com',
    bizNo: '111-22-33333',
    name: '고궁 찻집',
    roadAddress: '서울 중구 을지로',
    detailAddress: '지하 1층',
    info: '전통차 전문...',
    approvedDate: '2025-10-25',
    status: 'PENDING',
  },
];

// StoreSearchFilter와 StoreActions 두 컴포넌트를 가져와 사용

export default function StoreManagePage() {
  const navigate = useNavigate();
  const [filteredStores, setFilteredStores] = useState(dummy_stores);

  // 1. 검색 로직 (실제 API 호출이 이루어질 부분)
  const handleSearch = (params) => {
    console.log('검색 조건:', params);
    // 여기에 API를 호출하여 테이블 데이터를 가져오는 로직 추가
  };

  // 2. 액션 로직 (상태 변경, 승인/반려 등의 모달/API 호출 로직)
  const handleAction = (actionType) => {
    console.log('실행된 액션:', actionType);
    // 여기에 선택된 매장에 대한 액션 처리 로직 추가
  };

  // 3. 정렬 로직
  const handleSort = (sortBy) => {
    console.log('정렬 기준:', sortBy);
    // 여기에 테이블 데이터를 정렬하는 로직 추가
  };

  // 4. 행 클릭 핸들러 : 상세 페이지로 이동
  const handleRowClick = (storeId) => {
    // '제휴점 상세 정보 조회' 페이지 경로로 이동
    // 예 : /admin/stores/C000001
    navigate(`{storeId}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 🌟 1. 검색 필터 영역 🌟 */}
      <StoreSearchFilter onSearch={handleSearch} />

      {/* 🌟 2. 테이블 및 액션 영역 🌟 */}
      <Box sx={{ mt: 3 }}>
        {/* 액션 버튼 및 정렬 */}
        <StoreActions onStatusChange={handleAction} onSortChange={handleSort} />

        {/* 데이터 테이블 영역 */}
        <Box
          sx={{
            border: '1px solid #ccc',
            minHeight: '400px',
            bgcolor: '#424242',
            p: 1,
          }}
        >
          {/* 여기에 실제 MUI DataGrid 또는 Table 컴포넌트를 사용하여 매장 목록을 렌더링합니다. */}
          <Table sx={{ color: 'white' }}>
            <thead>
              <th>매장ID</th>
              <th>이메일</th>
              <th>사업자번호</th>
              <th>매장명</th>
              <th>도로명주소</th>
              <th>상세주소</th>
              <th>상세정보</th>
              <th>승인날짜</th>
              <th>매장상태</th>
            </thead>
            <tbody>여기에 필터된 매장 목록를 각각 링크를 줘서</tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  );
}
