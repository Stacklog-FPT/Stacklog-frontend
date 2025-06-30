import usePostApi from "../hooks/usePost";

const userApi = () => {
  const { postData, isLoading, error, data } = usePostApi();

  const login = async (email, passWord) => {
    if (!email || !passWord) {
      throw new Error("Please fill in both email and password");
    }

    try {
      const response = await postData("auth/login", { email, passWord });
      return response;
    } catch (err) {
      throw err;
    }
  };

  return { login, isLoading, error, data };
};

export default userApi;
