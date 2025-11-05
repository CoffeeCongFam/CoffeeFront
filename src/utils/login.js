import api from "./api";

export async function postCafe(data) {
  try {
    const response = await api.post("/owners/stores", data);
    // console.log(response.data.data)
    return response.data.success === true;
  } catch (error) {
    console.error("Error fetching cafe data:", error);
    return null;
  }
}