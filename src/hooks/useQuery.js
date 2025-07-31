import { useState } from "react";
const useQuery = (initial) => {
  const [query, setQuery] = useState(initial);

  const updateQuery = (newQuery) => {
    setQuery((prev) => ({
      ...prev,
      ...newQuery,
    }));
  };

  const resetQuery = () => {
    setQuery(initial);
  };

  return [query, updateQuery, resetQuery];
};

export default useQuery;
