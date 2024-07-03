const CLIENT_ID = '89da2fcbd3e3d07bab5b5f6846a2fdb7';
const REDIRECT_URI = 'http://localhost:5173/login/oauth2/callback/kakao';

export const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;