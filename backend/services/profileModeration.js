const axios = require("axios");
const FormData = require("form-data");

const moderateProfileImage = async (buffer, filename, mimetype) => {
  const form = new FormData();

  form.append("media", buffer, {
    filename,
    contentType: mimetype,
  });

  form.append("models", "nudity-2.1,gore-2.0");
  form.append("api_user", process.env.SIGHTENGINE_API_USER);
  form.append("api_secret", process.env.SIGHTENGINE_API_SECRET);

  try {
    const response = await axios.post(
      "https://api.sightengine.com/1.0/check.json",
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    const result = response.data;

    if (result?.status !== "success") {
      console.error("Sightengine response:", result);

      throw new Error(
        result?.error?.message ||
        result?.message ||
        "Image moderation failed."
      );
    }

    const nudity = result.nudity || {};
    const gore = result.gore || {};

    const blockedNudity =
      (nudity.sexual_activity || 0) >= 0.5 ||
      (nudity.sexual_display || 0) >= 0.5 ||
      (nudity.erotica || 0) >= 0.5;

    const blockedGore =
      (gore.prob || 0) >= 0.5;

    return {
      allowed: !blockedNudity && !blockedGore,
      nudity,
      gore,
    };
  } catch (error) {
    console.error(
      "Sightengine error:",
      error.response?.data || error.message
    );

    throw new Error(
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Image moderation failed."
    );
  }
};

module.exports = {
  moderateProfileImage,
};