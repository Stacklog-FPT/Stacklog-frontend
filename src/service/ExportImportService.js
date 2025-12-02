import axios from "axios";
import { REACT_API_URL } from "../api/apiConfig";

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
