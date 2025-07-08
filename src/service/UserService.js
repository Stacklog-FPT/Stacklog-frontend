import axios from "axios";
import usePostApi from "../hooks/usePost";

const userApi = () => {
  const { postData, isLoading, error, data } = usePostApi();

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please fill in both email and password");
    }

    try {
      const response = await postData("/auth/login", { email, password });
      return response;
    } catch (err) {
      throw err;
    }
  };

  const logout = async (token) => {
    try {
      const response = await axios.post(
        "http://103.166.183.142:8080/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // withCredentials: true,
        }
      );

      return response.data;
    } catch (e) {
      console.error("Logout API failed:", e?.response || e.message);
      throw e;
    }
  };

  return { login, logout, isLoading, error, data };
};

export default userApi;
