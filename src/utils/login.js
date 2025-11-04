import api from "./api";

export async function postCafe(data) {
  try {
    const response = await api.post("/api/owners/stores", data);
    // console.log(response.data.data)
    return response.data.data;
  } catch (error) {
    console.error("Error fetching cafe data:", error);
    return null;
  }
}