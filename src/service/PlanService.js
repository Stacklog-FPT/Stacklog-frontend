import axios from 'axios';

import {
  setPending,
  setError,
  setPlans,
  updatePlan,
  addPlan,
  deletePlan,
} from '../redux/slice/planSlice';

export const getPlansApi = async (dispatch, token) => {
  try {
    dispatch(setPending(true));
    const response = await axios.get('http://localhost:3001/topicRegistrations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(setPlans(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const updatePlanApi = async (topicId, payload, token, dispatch) => {
  try {
    dispatch(setPending(true));
    const response = await axios.put(
      `http://localhost:3001/topicRegistrations/${topicId}`,
    );
    dispatch(updatePlan(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const addPlanApi = async (planData, token, dispatch) => {
  try {
    dispatch(setPending(true));
    const response = await axios.post(`http://localhost:3001/topicRegistrations`, planData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(addPlan(response.data));
    dispatch(setPending(false));
    return response.data;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};

export const deletePlanApi = async (topicId, token, dispatch) => {
  try {
    dispatch(setPending(true));
    await axios.delete(`http://localhost:3001/topicRegistrations/${topicId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(deletePlan(topicId));
    dispatch(setPending(false));
    return topicId;
  } catch (e) {
    dispatch(setError(e.message));
    dispatch(setPending(false));
    throw new Error(e.message);
  }
};
