import axios from 'axios';
import { setError, setPending, updateTasks } from '../redux/slice/taskSlice';

const REVIEW_URL = 'https://stacklog.id.vn/api/task/review';
const ReviewService = () => {
  const deleteReview = async (token, id) => {
    try {
      if (!token) throw new Error('Token is missing!');
      const response = await axios.delete(`${REVIEW_URL}/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (e) {
      throw new Error(e.message || 'Failed to create review!');
    }
  };

  return { deleteReview };
};

// export const getAllReview = async (token, taskId, dispatch) => {
//   try {
//     if (!token) throw new Error('Token is missing!');
//     const response = await axios.get(`http://localhost:3001/task/${taskId}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response;
//   } catch (e) {
//     throw new Error(e.message || 'Something went wrong!');
//   }
// };

export const createReview = async (token, taskId, data, dispatch) => {
  try {
    if (!token) throw new Error('Token is missing!');
    dispatch(setPending(true));
    const response = await axios.put(`http://localhost:3001/task/${taskId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    dispatch(updateTasks(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setError(e.message));
    throw new Error(e.message || 'Failed to create review!');
  }
};

export default ReviewService;
