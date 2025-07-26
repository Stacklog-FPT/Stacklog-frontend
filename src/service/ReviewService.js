import axios from "axios";

const REVIEW_URL = "http://103.166.183.142:8080/api/task/review";
const ReviewService = () => {
  const getAllReview = async (token, taskId) => {
    try {
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

  return { getAllReview };
};

export default ReviewService;
