import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // ✅ LocationPinIcon 대신 권장
import { Box } from '@mui/material';
import menuDummy from "../../../assets/menuDummy.jpg";
import { useNavigate } from 'react-router-dom';

export default function LocalCafeImgList({ list = [] }) {

    const navigate = useNavigate();
    return (
        <Box
        sx={{
            width: '100%',
            height: 450,
            overflowY: 'auto',
        }}
        >
        <ImageList cols={5} gap={8} sx={{ m: 0 }}>
            {list.map((item, index) => (
            <ImageListItem
                onClick={() => navigate(`/me/store/${item.storeId}`)}
                key={item.storeId || item.partnerStoreId || item.storeName || index}
                sx={{ cursor: "pointer", position: 'relative' }} 
            >
                {/* 썸네일 이미지 */}
                <img
                src={menuDummy}
                alt={item.storeName}
                loading="lazy"
                style={{
                    borderRadius: '8px',
                    width: '100%',
                    display: 'block',
                }}
                />

                {/* 거리 배지 (우상단 고정) */}
                {typeof item.distanceKm === 'number' && (
                <Box
                    sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 111, 67, 0.82)', // hotpink 반투명
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    px: 1,
                    py: 0.3,
                    borderRadius: '8px',
                    zIndex: 2,
                    }}
                >
                    {item.distanceKm.toFixed(1)} km
                </Box>
                )}

                {/* 하단 정보 바 */}
                <ImageListItemBar
                title={item.storeName}
                subtitle={
                    <span>
                    {(item.roadAddress || '') + (item.detailAddress || '')}
                    </span>
                }
                actionIcon={
                    <IconButton
                    sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                    aria-label={`위치 보기: ${item.storeName}`}
                    >
                    <LocationOnIcon />
                    </IconButton>
                }
                />
            </ImageListItem>
            ))}
        </ImageList>
        </Box>
    );
}
