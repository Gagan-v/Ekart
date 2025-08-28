import axios from "axios";

const API_BASE = "http://localhost:1337/api";

export const fetchLandingSections = async () => {
  try {
    const res = await axios.get(`${API_BASE}/landing-section?populate=*`); //(?.) → avoids errors if image is missing.
    return res.data.data;
    // res.data → entire JSON from Strapi
    // res.data.data → array of collection entries(this is how strapi works)
  } catch (err) {
    console.error(err);
    return [];
  }
};
