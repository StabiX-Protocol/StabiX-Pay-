const pool = require("../config/db");

const verifyValidator = async (req, res, next) => {

  try {

    const result = await pool.query(
      `SELECT role
       FROM users
       WHERE stbx_uid = $1`,
      [req.user.stbx_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (result.rows[0].role !== "VALIDATOR") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }

};

module.exports = {
  verifyValidator
};