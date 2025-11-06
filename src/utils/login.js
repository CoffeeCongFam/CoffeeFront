import api from "./api";

export async function postCafe(formData) {
  try {
    const response = await api.post("/owners/stores", formData, {
      headers: {
        "Content-Type" : "multipart/form-data",
      }
    });
    // console.log(response.data.data)
    return response.data.success === true;
  } catch (error) {
    console.error("Error fetching cafe data:", error);
    return null;
  }
}