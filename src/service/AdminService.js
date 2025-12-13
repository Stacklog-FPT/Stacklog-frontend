import axios from "axios";
import {
  addSemeter,
  deleteSemester,
  getClasses,
  getLectures,
  getSemesters,
  getStudents,
  setError,
  setPending,
  setAllAdminData,
  resetClasses,
  addClass,
} from "../redux/slice/userSilce";
import { REACT_API_URL } from "../api/apiConfig";

const API_URL = REACT_API_URL;
export const getAllAdminDataOnce = async (token, dispatch) => {
  if (!token) return;

  try {
    dispatch(setPending(true));

    const { data: semesters } = await axios.get(
      `${REACT_API_URL}class/semester/getall`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const [lecturesRes, studentsRes] = await Promise.all([
      axios.get(`${REACT_API_URL}profile/user/role/LECTURER`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${REACT_API_URL}profile/user/role/STUDENT`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    dispatch(
      setAllAdminData({
        semesters: semesters || [],
        lectures: lecturesRes.data || { users: [] },
        students: studentsRes.data || { users: [] },
      })
    );
    dispatch(setPending(false));
  } catch (error) {
    const message = error.response?.data?.message || error.message;
    dispatch(setError(message));
    throw error;
  } finally {
    dispatch(setPending(false));
  }
};

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
    console.log(data);
    const response = await axios.post(
      `https://stacklog.id.vn/api/class/semester/save`,
      {
        semesterName: data.semesterName,
        semesterYear: data.semesterYear,
        quarter: data.quarter,
        semesterStartDate: data.semesterStartDate,
        semesterEndDate: data.semesterEndDate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(response);
    // dispatch(addSemeter(response.data));
    if (response.data) {
      dispatch(setPending(false));
    }
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
      `https://stacklog.id.vn/api/class/semester/delete?semesterId=${semesterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response);

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
    dispatch(resetClasses());
    const response = await axios.get(
      `${REACT_API_URL}class/class/${semesterId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Service Response:", response);
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

export const getAllStudent = async (token, dispatch) => {
  try {
    if (!token) {
      setError("The token is required!");
      return;
    }

    dispatch(setPending(true));
    const response = await axios.get(
      `${REACT_API_URL}profile/user/role/STUDENT`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(setPending(false));
    dispatch(getStudents(response.data));
  } catch (e) {
    setError(e.message || "Something went wrong!");
  }
};

export const createNewClass = async (data, token, dispatch) => {
  try {
    if (!token) {
      dispatch(setError("Invalid token!"));
      throw new Error("Invalid token!");
    }
    dispatch(setPending(true));
    console.log("Service data: ", data);
    const response = await axios.post(
      `${API_URL}class/class?semesterId=${data.semesterId}`,
      {
        classesName: data.className,
        lectureId: data.lectureId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data) {
      dispatch(setPending(false));
      console.log("Service response data: ", response.data);
      // dispatch(addClass(response.data));
    }

    return response;
  } catch (e) {
    dispatch(setError(e.message));
    throw new Error(e.message);
  }
};

export const lockUser = async (token, userId) => {
  try {
    if (!token) {
      throw new Error("Invalid token!");
    }
    setPending(true);

    const response = await axios.put(
      `https://stacklog.id.vn/api/profile/user/lockunlock/${userId}`
    );

    setPending(false);
    return response;
  } catch (e) {
    setPending(false);
    throw new Error();
  }
};
