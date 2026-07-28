const pool = require("../config/db");

const registerUser = async (req, res) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const { stbx_uid, google_uid, username, eoa_address } = req.body;

        const result = await client.query(
            `INSERT INTO users
            (stbx_uid, google_uid, username, eoa_address)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [stbx_uid, google_uid, username, eoa_address]
        );

        // Username permanently reserve
        await client.query(
            `INSERT INTO username_history
            (user_id, username, is_current)
            VALUES ($1, $2, TRUE)`,
            [result.rows[0].id, username]
        );

        await client.query("COMMIT");

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: result.rows[0]
        });

    } catch (err) {

        await client.query("ROLLBACK");

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    } finally {

        client.release();

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


const updateUsername = async (req, res) => {
const client = await pool.connect();
try {
const { stbx_uid, new_username } = req.body;
await client.query("BEGIN");

const userResult = await client.query(
"SELECT * FROM users WHERE stbx_uid = $1",
[stbx_uid]
);
if (userResult.rows.length === 0) {
await client.query("ROLLBACK");
    return res.status(404).json({
        success: false,
        message: "User not found"
    });
}

const user = userResult.rows[0];
if (user.last_username_change) {const lastChange = new Date(user.last_username_change);
const today = new Date();
const diffDays = Math.floor(
(today - lastChange) / (1000 * 60 * 60 * 24)
);
if (diffDays < 90) {
await client.query("ROLLBACK");
return res.status(400).json({
success: false,
message: `Username can only be changed after ${90 - diffDays} more days.`
});
}
}

const historyResult = await client.query(
`SELECT * FROM username_history WHERE username = $1`,
[new_username]
);
if (historyResult.rows.length > 0) {
const history = historyResult.rows[0];
if (history.user_id !== user.id) {
await client.query("ROLLBACK");
return res.status(400).json({
success: false,
message: "Username already reserved."
});
}
}

await client.query(
`UPDATE username_history
SET is_current = FALSE,
released_at = CURRENT_TIMESTAMP
WHERE user_id = $1
AND is_current = TRUE`,
[user.id]
);

if (historyResult.rows.length === 0) {
await client.query(
`INSERT INTO username_history
(user_id, username, is_current)
VALUES ($1, $2, TRUE)`,
[user.id, new_username]
);

} else {
await client.query(
`UPDATE username_history
SET is_current = TRUE,
released_at = NULL
WHERE id = $1`,
[historyResult.rows[0].id]
);
}

await client.query(
`UPDATE users
SET username = $1,
last_username_change = CURRENT_TIMESTAMP
WHERE id = $2`,
[new_username, user.id]
);
await client.query("COMMIT");
res.status(200).json({
success: true,
message: "Username updated successfully"
});

} catch (err) {

    await client.query("ROLLBACK");

    console.log("========== ERROR ==========");
    console.log(err);
    console.log("Message:", err.message);
    console.log("Code:", err.code);
    console.log("===========================");

    res.status(500).json({
        success: false,
        message: err.message
    });

} finally {

    client.release();

}
};

module.exports = { registerUser, getUser, updateUsername };
