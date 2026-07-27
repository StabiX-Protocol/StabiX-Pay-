const pool = require("../config/db");

const registerUser = async (req, res) => {
    try {
        const { stbx_uid, google_uid, username, eoa_address } = req.body;

        const result = await pool.query(
            `INSERT INTO users
            (stbx_uid, google_uid, username, eoa_address)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [stbx_uid, google_uid, username, eoa_address]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getUser = async (req, res) => {
    try {
        const { stbx_uid } = req.params;

        const result = await pool.query(
            "SELECT * FROM users WHERE stbx_uid = $1",
            [stbx_uid]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: result.rows[0]
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Database Error"
        });
    }
};

module.exports = { registerUser,getUser,};