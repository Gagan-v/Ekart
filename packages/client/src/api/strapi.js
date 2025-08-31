import axios from "axios";

export const fetchLandingSections = async () => {
  try {
    const res = await axios.get(
      "http://localhost:1337/api/landing-sections?populate=*"
    ); //(?.) → avoids errors if image is missing.
    return res.data.data;
    // res.data → entire JSON from Strapi
    // res.data.data → array of collection entries(this is how strapi works)
  } catch (err) {
    console.error("AxiosError:", err);
    throw err;
  }
};
