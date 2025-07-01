import usePostApi from "../hooks/usePost";

const userApi = () => {
  const { postData, isLoading, error, data } = usePostApi();

  const login = async (email, password) => {
    if (!email || !password) {
      throw new Error("Please fill in both email and password");
    }

    try {
      const response = await postData("auth/login", { email, password });
      return response;
    } catch (err) {
      throw err;
    }
  };

  return { login, isLoading, error, data };
};

export default userApi;
