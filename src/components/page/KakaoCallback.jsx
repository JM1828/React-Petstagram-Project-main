import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useUser from "../hook/useUser";
import KakaoService from "../service/KakaoService"

const KakaoCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setIsLoggedIn } = useUser();

    useEffect(() => {
        const fetchKakaoToken = async () => {
            const code = new URLSearchParams(location.search).get("code");
            if (code) {
                try {
                    const response = await KakaoService.getAccessToken(code);
                    const token = response.token;
                    if (token) {
                        localStorage.setItem("token", token);
                        setIsLoggedIn(true);
                        navigate("/");
                    } else {
                        console.error("로그인 실패:", data.message);
                    }
                } catch (error) {
                    console.error("카카오 로그인 에러:", error);
                }
            }
        };

        fetchKakaoToken();
    }, [location, navigate, setIsLoggedIn]);

    return <div>카카오 로그인 중...</div>;
};

export default KakaoCallback;