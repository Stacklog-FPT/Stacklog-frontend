import axios from 'axios';
import { setError, setPending, updateTasks } from '../redux/slice/taskSlice';
import { REACT_API_URL } from '../api/apiConfig';
const REVIEW_URI = REACT_API_URL + 'task/review';
const ReviewService = () => {
  const deleteReview = async (token, id) => {
    console.log('Call me delete review: ', id);
    try {
      if (!token) throw new Error('Token is missing!');
      const response = await axios.delete(`${REVIEW_URI}/${id}`, {
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

export const createReview = async (token, groupId, data, dispatch) => {
  try {
    if (!token) throw new Error('Token is missing!');
    dispatch(setPending(true));
    const response = await axios.post(`${REVIEW_URI}/${groupId}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Review response: ', response);
    dispatch(updateTasks(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setError(e.message));
    throw new Error(e.message || 'Failed to create review!');
  }
};
export default ReviewService;
