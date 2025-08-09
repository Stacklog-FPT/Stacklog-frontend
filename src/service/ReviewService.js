import axios from "axios";

const REVIEW_URL = "https://stacklog.id.vn/api/task/review";
const ReviewService = () => {
  const getAllReview = async (token, taskId) => {
    try {
      if (!token) throw new Error("Token is missing!");
      const response = await axios.get(`${REVIEW_URL}/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (e) {
      throw new Error(e.message || "Something went wrong!");
    }
  };

  const createReview = async (token, data) => {
    try {
      if (!token) throw new Error("Token is missing!");
      const response = await axios.post(`${REVIEW_URL}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (e) {
      throw new Error(e.message || "Failed to create review!");
    }
  };

  const deleteReview = async (token, id) => {
    try {
      if (!token) throw new Error("Token is missing!");
      const response = await axios.delete(`${REVIEW_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (e) {
      throw new Error(e.message || "Failed to create review!");
    }
  };

  return { getAllReview, createReview, deleteReview };
};

export default ReviewService;
