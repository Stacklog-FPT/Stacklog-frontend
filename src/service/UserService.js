import axios from "axios";
import usePostApi from "../hooks/usePost";
import { useDispatch } from "react-redux";
import {
  setUserInfo,
  updateUserInfo,
  setPending,
} from "../redux/slice/userSilce";
import { REACT_API_URL } from "../api/apiConfig";

const API_AUTH = REACT_API_URL;

export const fetchUserById = async (token, id) => {
  if (!token) throw new Error("Unauthorized: No token provided");
  if (!id) throw new Error("Invalid user ID");
  try {
    const response = await axios.get(`${API_AUTH}profile/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (token, userId, data, dispatch) => {
  try {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!userId) throw new Error("Invalid user ID");

    dispatch(setPending(true));
    let avatarUrl = data.avatar_link;
    if (data.avatar_link && typeof data.avatar_link !== "string") {
      const file = data.avatar_link;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "StackLog");
      formData.append("cloud_name", "dogkzlnvj");

      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/dogkzlnvj/image/upload",
        formData
      );

      avatarUrl = uploadRes.data.secure_url;
    }
    const payload = {
      id: data._id,
      email: data.email,
      full_name: data.full_name?.trim(),
      description: data.description?.trim() || "",
      work_id: data.work_id?.trim() || "",
      role: data.role,
      avatar_link: avatarUrl,
    };

    const response = await axios.put(
      `${API_AUTH}profile/user/update/${payload.id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(updateUserInfo(response.data));
    dispatch(setPending(true));
    return response;
  } catch (error) {
    console.error("Update profile error:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to update profile";
    throw new Error(message);
  }
};

const userApi = () => {
  const { postData, isLoading, error, data } = usePostApi();
  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please fill in both email and password");
    }

    try {
      const response = await postData(`${API_AUTH}auth/login`, {
        email,
        password,
      });
      return response;
    } catch (err) {
      throw err;
    }
  };

  const loginGoogle = async (tokenGoogle) => {
    if (!tokenGoogle) throw new Error("The token google is missing!");

    try {
      const res = await axios.post(`${API_AUTH}auth/login-google`, {
        idToken: tokenGoogle,
      });
      return res;
    } catch (e) {
      throw new Error(e.message);
    }
  };

  const logout = async (token) => {
    try {
      const response = await axios.post(
        `${API_AUTH}auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      sessionStorage.clear();
      localStorage.clear();
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
      const response = await axios.get(
        `${API_AUTH}profile/user/email/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  const getUserById = async (token, id, dispatch) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    if (!id) throw new Error("Invalid user ID");
    try {
      const response = await axios.get(`${API_AUTH}profile/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setUserInfo(response.data.user));
      return response.data.user;
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const getAllUsers = async (token) => {
    if (!token) throw new Error("Unauthorized: No token provided");
    try {
      const url = `${API_AUTH}profile/user/find/n`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
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
    getUserById,
    getAllUsers,
    loginGoogle,
  };
};

export default userApi;
