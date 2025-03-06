import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

const apiClient = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true,
});

apiClient.interceptors.request.use(
    async (config) => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
console.log(accessToken,refreshToken,'*********************');

        config.headers["Authorization"] = `Bearer ${accessToken}`;
        config.headers["x-token"] = `Bearer ${refreshToken}`;
       
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem("refreshToken");

            if (refreshToken) {
                try {
                    const response = await axios.post(`${baseUrl}/api/auth/refreshToken`, {
                        refresh_token: refreshToken,
                    });

                    if (response.status === 200) {
                        localStorage.setItem("accessToken", response.data.accessToken);
                        localStorage.setItem("refreshToken", response.data.refreshToken);

                        error.config.headers["Authorization"] = `Bearer ${response.data.accessToken}`;
                        return axios(error.config);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed:", refreshError);
                    localStorage.clear();
                    window.location.href = "/";
                }
            } else {
                localStorage.clear();
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
