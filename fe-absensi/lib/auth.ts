import axios from "axios";
const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const login = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const response = await axios.post(`${baseUrl}/auth/login`, {
    username,
    password,
  });

  const token = response.data.access_token;
  localStorage.setItem("token", token);

  return response.data;
};
