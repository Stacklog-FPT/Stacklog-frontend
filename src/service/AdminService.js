import axios from "axios";
import {
  addSemeter,
  deleteSemester,
  getClasses,
  getLectures,
  getSemesters,
  getStudents,
  resetClasses,
  setError,
  setPending,
} from "../redux/slice/userSilce";
import { REACT_API_URL } from "../api/apiConfig";

export const getAllSemester = async (token, dispatch) => {
  try {
    dispatch(setPending(true));

    const response = await axios.get(`${REACT_API_URL}class/semester/getall`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(getSemesters(response.data));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setPending(false));
  }
};

export const createNewSemester = async (data, token, dispatch) => {
  try {
    if (!token) {
      setError("Authorization!");
      return;
    }

    dispatch(setPending(true));
    const response = await axios.post(`${REACT_API_URL}class/semester/`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(addSemeter(response.data));
    dispatch(setPending(false));
  } catch (e) {
    setError(e.message);
    throw new Error(e.message);
  }
};

export const deleteSemesterService = async (semesterId, token, dispatch) => {
  try {
    if (!token) {
      setError("The token is invalid!");
      return;
    }

    dispatch(setPending(true));
    const response = await axios.delete(
      `${REACT_API_URL}class/semester/?semesterId=${semesterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(setPending(false));
    dispatch(deleteSemester(semesterId));

    return response;
  } catch (e) {
    setError(e.message);
  }
};

export const getAllClasses = async (semesterId, token, dispatch) => {
  if (!semesterId) return;

  try {
    dispatch(setPending(true));
    // dispatch(resetClasses());
    const response = await axios.get(
      `${REACT_API_URL}class/class/${semesterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(getClasses(response.data));
  } catch (error) {
    dispatch(setError(error.message));
    console.error("Error getAllClasses:", error);
  } finally {
    dispatch(setPending(false));
  }
};

export const getAllLecture = async (token, dispatch) => {
  try {
    if (!token) throw new Error("The token is invalid");
    dispatch(setPending(true));
    const response = await axios.get(
      `${REACT_API_URL}profile/user/role/LECTURER`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    dispatch(setPending(false));
    dispatch(getLectures(response.data));
  } catch (e) {
    dispatch(setError(e.message || "Something went wrong!"));
  }
};

export const getAllStudent = async (role, token, dispatch) => {
  try {
    if (!token) {
      setError("The token is required!");
      return;
    }

    dispatch(setPending(true));
    const response = await axios.get(``, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    dispatch(setPending(false));
    dispatch(getStudents(response.data));
  } catch (e) {
    setError(e.message || "Something went wrong!");
  }
};
