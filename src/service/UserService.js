import axios from "axios";
import usePostApi from "../hooks/usePost";

const API_AUTH = "http://103.166.183.142:8080/api/";
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
        }
      );
      return response.data;
    } catch (e) {
      console.error("Logout API failed:", e?.response || e.message);
      throw e;
    }
  };

  const getUserByEmail = async (token, email) => {
    if (!token) {
      throw new Error("Unauthorized: No token provided");
    }
    if (!email) {
      throw new Error("Invalid email format");
    }

    try {
      const response = await axios.get(`${API_AUTH}profile/user/${email}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const getUserByRole = async (token, role) => {
    try {
      if (!token) throw new Error("Unauthorized: No token provided");

      if (!role) throw new Error("Invalid role or lack of the role");

      const response = await axios.get(`${API_AUTH}profile/user/role/${role}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return {
    login,
    logout,
    isLoading,
    error,
    data,
    getUserByEmail,
    getUserByRole,
  };
};

export default userApi;
