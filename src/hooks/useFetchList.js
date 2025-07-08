import { useEffect, useState } from "react";
import api from "../axios";

const useFetchList = (path, query, config = {}) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetchApi = async () => {
      const queryString = new URLSearchParams(query);
      const response = await api.get(`${path}`, config);
      setData(response.data[path]);
    };

    fetchApi();
  }, [path, JSON.stringify(query), JSON.stringify(config)]);
  return [data];
};

export default useFetchList;
