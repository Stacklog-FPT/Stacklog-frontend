import axios from "axios";

const getAllTask = async (token) => {
  if (!token) return "Unauthorization";

  try {
    const response = await axios.get("", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
  } catch (e) {
    console.log(e.message);
  }
};
