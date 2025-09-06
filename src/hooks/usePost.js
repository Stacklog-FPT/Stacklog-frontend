import { useState, useCallback } from "react";
import api from "../axios/index";

const usePostApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const postData = useCallback(async (endpoint, payload) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await api.post(endpoint, payload);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "An error occurred"
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { postData, isLoading, error, data };
};

export default usePostApi;
