import axios from "../axiosInstance";

const baseUrl = "/employees";

export interface CreateEmployeePayload {
  rfid_code: string;
  nik: string;
  name: string;
  position: string;
  department: string;
}
export interface UpdateEmployeePayload {
  rfid_code?: string;
  nik?: string;
  name?: string;
  position?: string;
  department?: string;
}

export const getAllEmployees = async () => {
  const res = await axios.get(baseUrl);
  return res.data;
};

export const getEmployeeById = async (id: string) => {
  const res = await axios.get(`${baseUrl}/${id}`);
  return res.data;
};

export const createEmployee = async (data: CreateEmployeePayload) => {
  const res = await axios.post(baseUrl, data);
  return res.data;
};

export const updateEmployee = async (
  id: number,
  data: UpdateEmployeePayload
) => {
  const res = await axios.patch(`${baseUrl}/${id}`, data);
  return res.data;
};

export const deleteEmployee = async (id: number) => {
  const res = await axios.delete(`${baseUrl}/${id}`);
  return res.data;
};
