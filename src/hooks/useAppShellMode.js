import { useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

export default function useAppShellMode() {

    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("md"));    // md 이하 -> 모바일
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        const check = () => {
            const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
            setIsPWA(standalone);
        };
        check();

        const mm = window.matchMedia("(display-mode: standalone)");
        mm.addEventListener("change", check);

        return () => mm.removeEventListener("chagne", check);
    }, [])

    // PWA이거나 화면이 작으면 "앱 모드"
    const isAppLike = isPWA || isSmall;
    return { isAppLike, isPWA, isSmall };
}

