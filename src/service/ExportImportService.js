import axios from "axios";
import { REACT_API_URL } from "../api/apiConfig";
import { setError } from "../redux/slice/userSilce";

const API_URL = REACT_API_URL;

export const exportByRole = async (role, token) => {
  try {
    if (!token) throw new Error("Invalid token!");

    const response = await axios.get(
      `${API_URL}profile/user/export-excel/${role}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "arraybuffer",
      }
    );

    const disposition =
      response.headers["content-disposition"] ||
      response.headers["Content-Disposition"];
    let filename = "student_export.xlsx";
    if (disposition) {
      const fileMatch = disposition.match(
        /filename\*?=(?:UTF-8'')?"?([^";]+)/i
      );
      if (fileMatch && fileMatch[1]) {
        try {
          filename = decodeURIComponent(fileMatch[1]);
        } catch (e) {
          filename = fileMatch[1];
        }
      }
    }

    const contentType =
      response.headers["content-type"] ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    return {
      data: response.data,
      filename,
      contentType,
      headers: response.headers,
    };
  } catch (e) {
    throw new Error(e.message);
  }
};

export const importByRole = async (role, file, token, dispatch) => {
  try {
    if (!token) {
      dispatch(setError("Invalid token!"));
      throw new Error("Something went wrong!");
    }

    if (!file) {
      dispatch(setError("File is required!"));
    }

    const form = new FormData();
    form.append("file", file);

    const response = await axios.post(
      `${API_URL}profile/user/import-excel/${role}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(response.data);
  } catch (e) {
    throw new Error();
  }
};
