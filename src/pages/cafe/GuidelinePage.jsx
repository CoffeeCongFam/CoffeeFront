// src/pages/GuidelinePage.jsx
import React, { useEffect } from 'react';
import { Box, Typography } from '@mui/material';

// =====================================================================
// ⚠️ 1. GUIDELINE_STYLE 변수 (MUI 스타일 CSS 전체)
// =====================================================================
const GUIDELINE_STYLE = `
    /* 폰트 및 기본 설정 */
    body {
        font-family: 'Noto Sans KR', sans-serif;
        background-color: #f4f5f8; /* MUI 스러운 밝은 배경 */
        color: #212121;
        padding: 0; 
    }
    .guide-container { 
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px; /* Material Design 곡률 */
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23); /* MUI 그림자 */
        padding: 32px;
        min-height: 80vh;
    }
    
    /* 헤더 및 타이틀 */
    .header-title {
        font-weight: 700;
        color: #388e3c; /* PRIMARY_COLOR_MAIN (예시) */
        margin-bottom: 24px;
        padding-bottom: 12px;
        border-bottom: 2px solid #e0e0e0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .header-title .material-icons {
        font-size: 36px;
    }
    
    /* 섹션 타이틀 (MUI Chip/Badge 스타일) */
    .section-title {
        font-weight: 600;
        color: #1976d2; /* SECONDARY_COLOR (예시) */
        margin-top: 30px;
        margin-bottom: 20px;
        padding: 8px 15px;
        background-color: #e3f2fd; /* Light Blue 50 */
        border-radius: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    /* 스텝 및 카드 스타일 */
    .step-card {
        margin-bottom: 20px;
        padding: 16px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
        background-color: #ffffff;
        border-left: 5px solid #64b5f6; /* Blue 300 */
    }
    .step-card h5 {
        font-weight: 500;
        color: #424242;
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    /* 안내/팁 (MUI Alert 스타일) */
    .alert-info-mui {
        padding: 12px;
        border-radius: 4px;
        margin: 15px 0;
        display: flex;
        align-items: flex-start;
        gap: 10px;
    }
    .alert-tip {
        background-color: #fffde7; /* Yellow 50 */
        border: 1px solid #ffcc80; /* Orange 200 */
        color: #6d4c41; /* Brown 700 */
    }
    .alert-tip .material-icons {
        color: #ff9800; /* Orange 500 */
    }

    /* 테이블 및 버튼 스타일 */
    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        font-size: 0.95rem;
    }
    th, td {
        border: 1px solid #e0e0e0;
        padding: 8px;
        text-align: left;
    }
    th {
        background-color: #f5f5f5; /* Grey 100 */
        font-weight: 500;
    }
    
    /* MUI Badge/Chip 컬러 스킴 재현 */
    .chip {
        padding: 3px 8px;
        border-radius: 16px;
        font-size: 0.8rem;
        font-weight: 500;
        color: white;
        white-space: nowrap;
    }
    .chip-request { background-color: #ff9800; } /* Orange */
    .chip-progress { background-color: #2196f3; } /* Blue */
    .chip-completed { background-color: #4caf50; } /* Green */
    .chip-received { background-color: #757575; } /* Gray */
    .chip-action { color: #1976d2; border: 1px solid #1976d2; background-color: white; padding: 4px 10px; border-radius: 4px;}
    .chip-reject { background-color: #f44336; } /* Red */

    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    
    /* 아이콘 폰트 로드 */
    .material-icons { font-family: 'Material Icons'; } 
`;

// =====================================================================
// ⚠️ 2. GUIDELINE_CONTENT 변수 (가이드라인 HTML 내용 전체)
// =====================================================================
const GUIDELINE_CONTENT = `
    <div class="guide-container">
        <h1 class="header-title">
            <Coffeens class="material-icons">COFFIENS 점주 사용 가이드
        </h1>
        <p class="text-center" style="color: #757575;">효율적인 매장 운영을 위해 제작된 가이드입니다.</p>
        
        <h2 class="section-title">
            <i class="material-icons">1. 홈화면 : 실시간 주문 현황
        </h2>
        
        <div class="step-card">
            <h5><i class="material-icons" style="color: #ff9800;">실시간 갱신 및 알림</i></h5>
            <div class="alert-info-mui alert-tip">
                <div>
                    고객이 새로운 주문을 접수하면, 주문 목록과 알림이 옵니다 .<br>
                    점주님은 '실시간 현황판'을 확인하실 수 있는 페이지입니다.
                </div>
            </div>
            <ul>
                <li>알림 아이콘: 오른쪽 상단에 아이콘에 미읽음 카운트가 표시됩니다.</li>
                <li>우선순위 정렬: <span class="chip chip-request">접수 중</span> 주문이 가장 위에 왼쪽으로 정렬되기에 우선순위를 파악하기 쉽습니다.</li>
            </ul>
        </div>

        <div class="step-card">
            <h5><i class="material-icons" style="color: #ff9800;">주문 처리별 단계 진행</i></h5>
            <p>각 주문 카드의 상태를 확인하고, 하단 버튼을 클릭하여 상태를 변경합니다.</p>
            <table>
                <thead>
                    <tr>
                        <th>현재 상태</th>
                        <th>표시 색상</th>
                        <th>다음 버튼 액션</th>
                        <th>설명</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="chip chip-request">REQUEST (접수 중)</span></td>
                        <td>주황</td>
                        <td><span class="chip-action">주문 접수 하기</span></td>
                        <td>주문을 확인하고 제조를 시작합니다.</td>
                    </tr>
                    <tr>
                        <td><span class="chip chip-progress">INPROGRESS (제조 중)</span></td>
                        <td>파랑</td>
                        <td><span class="chip-action">제조 완료</span></td>
                        <td>음료 제조 완료 후, 고객에게 픽업 알림을 보냅니다.</td>
                    </tr>
                    <tr>
                        <td><span class="chip chip-completed">COMPLETED (제조 완료)</span></td>
                        <td>초록</td>
                        <td><span class="chip-action">수령 완료 처리</span></td>
                        <td>고객의 주문 번호가 맞는지 확인해보고 고객에게 제품 전달 후 최종적으로 주문을 마감합니다.</td>
                    </tr>
                    <tr>
                        <td><span class="chip chip-reject">REJECTED (주문 거부)</span></td>
                        <td>빨강</td>
                        <td>(버튼 없음)</td>
                        <td>상세 보기에서 **주문 거부 사유**를 입력 후 처리합니다.</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <hr style="border-top: 1px solid #eeeeee;">

        <h2 class="section-title">
            2. 메뉴 및 구독권 관리
        </h2>
        
        <div class="step-card">
            <h5> 메뉴 관리 </h5>
            <p>일반 음료/식품 메뉴의 가격, 카테고리, 판매 상태를 관리합니다.</p>
            <ul>
                <li>메뉴 상태: 수정 버튼을 통해 품절 처리 또는 가격 변경이 가능합니다.</li>
                <li>필수 항목: 구독권에 포함될 메뉴는 반드시 여기에 등록되어 있어야 합니다.</li>
            </ul>
        </div>

        <div class="step-card">
            <h5> 구독권 등록 </h5>
            <p>신규 정기 구독권 상품을 등록하는 모달창 사용법입니다.</p>
            <ol>
                <li>기본 정보 입력 : 구독권 이름, 가격, 기간, 유형을 정확히 입력합니다.</li>
                <li>포함 메뉴 선택 : <span style="font-weight: 700;">구독권 사용 메뉴</span>를 최소 **1개 이상** 필수로 선택해야 합니다.</li>
                <li>판매 수량 설정 : \`판매 가능 수량\`을 설정하면, 해당 수량이 모두 판매되면 상태가 \`품절\`로 자동 변경됩니다.</li>
            </ol>
            <div class="alert-info-mui alert-tip">
                <span style="font-weight: 700;">유효성 검사 (Validation):</span> 필수 입력 항목(이름, 가격, 수량, 기간, 메뉴 선택)이 유효하지 않으면 등록 버튼을 눌러도 등록되지 않습니다.
            </div>
        </div>
        
        <hr style="border-top: 1px solid #eeeeee;">

        <h2 class="section-title">
            <i class="material-icons">settings</i> 3. 기타 기능
        </h2>
        <div class="step-card">
            <h5>지난 주문 내역 </h5>
            <p>오늘 주문 외에 **과거의 모든 주문**을 조회하고 검색하는 페이지입니다.</p>
        </div>
        <div class="step-card">
            <h5> 매장 정보 </h5>
            <p>고객에게 노출되는 **영업 시간, 매장 위치, 휴무일** 등 중요 정보를 수정합니다.</p>
        </div>

        <footer style="text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #9e9e9e;">
            <p>&copy; 2025 COFFIENS Store Dashboard - Always Happy to Serve</p>
        </footer>
    </div>
`;
// =====================================================================

const GuidelinePage = () => {
  // CSS 스타일을 React가 렌더링할 때 <style> 태그로 삽입
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = GUIDELINE_STYLE;
    document.head.appendChild(styleTag);

    // Material Icons 폰트 로드 (GUIDELINE_STYLE에 .material-icons { font-family: 'Material Icons'; } 만으로는 부족할 수 있음)
    // 만약 아이콘이 깨진다면, 아래 링크 태그를 DOM에 추가하는 로직을 추가해야 합니다.
    // const linkTag = document.createElement('link');
    // linkTag.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
    // linkTag.rel = "stylesheet";
    // document.head.appendChild(linkTag);

    return () => {
      // 컴포넌트 언마운트 시 스타일 제거
      document.head.removeChild(styleTag);
      // document.head.removeChild(linkTag); // (링크 태그를 추가했다면 같이 제거)
    };
  }, []);

  // dangerouslySetInnerHTML을 사용하여 HTML 콘텐츠 주입
  return (
    <Box sx={{ p: 0, width: '100%' }}>
      {/* HTML 컨텐츠를 주입. React가 아닌 코드를 삽입할 때 사용되므로 주의 필요 */}
      <div dangerouslySetInnerHTML={{ __html: GUIDELINE_CONTENT }} />
    </Box>
  );
};

export default GuidelinePage;
