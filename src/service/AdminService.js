import axios from "axios";
import {
  getClasses,
  getLectures,
  getSemesters,
  getStudents,
  setError,
  setPending,
} from "../redux/slice/userSilce";
import { REACT_API_URL } from "../api/apiConfig";

export const getAllSemester = async (token, dispatch) => {
  console.log("Call me admin");
  try {
    dispatch(setPending(true));

    const response = await axios.get(`${REACT_API_URL}class/semester`, {
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

export const getAllClasses = async (semesterId, token, dispatch) => {
  if (!semesterId) return;

  try {
    dispatch(setPending(true));

    const response = await axios.get(
      `${REACT_API_URL}/class/class/${semesterId}`,
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

export const getAllLecture = async (role, token, dispatch) => {
  try {
    if (!token) throw new Error("The token is invalid");
    dispatch(setPending(true));
    const response = await axios.get(`${REACT_API_URL}profile/role/${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
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
