const pool = require("../config/db");
const { generateToken } = require("../utils/jwt");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginUser = async (req, res) => {
try {
const { stbx_uid, password } = req.body;

const result = await pool.query(
`SELECT
stbx_uid,
google_uid,
username,
password
FROM users
WHERE stbx_uid = $1`,
[stbx_uid]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Invalid StabiX ID or password"
});
}

const user = result.rows[0];

if (!user.password) {
return res.status(400).json({
success: false,
message: "Password login is not available for this account"
});
}

const validPassword = await bcrypt.compare(
password,
user.password
);

if (!validPassword) {
return res.status(401).json({
success: false,
message: "Invalid StabiX UID or password"
});
}

const token = generateToken({
stbx_uid: user.stbx_uid,
username: user.username
});

return res.status(200).json({
success: true,
user: {
stbx_uid: user.stbx_uid,
google_uid: user.google_uid,
username: user.username
},
token
});

} catch (err) {
console.error(err);

return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};


const getProfile = async (req, res) => {
try {
const { stbx_uid } = req.params;

const result = await pool.query(
`SELECT
stbx_uid,
username,
eoa_address,
created_at,
last_username_change
FROM users
WHERE stbx_uid = $1
`,
[stbx_uid]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "User not found"
});
}

return res.status(200).json({
success: true,
user: result.rows[0]
});

} catch (err) {
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};

const registerUser = async (req, res) => {
const client = await pool.connect();
try {
await client.query("BEGIN");
const { stbx_uid, google_id_token, google_uid, username, eoa_address, password } = req.body;

let finalGoogleUid = google_uid || null;

if (google_id_token) {
const ticket = await googleClient.verifyIdToken({
idToken: google_id_token,
audience: process.env.GOOGLE_CLIENT_ID
});

const payload = ticket.getPayload();
finalGoogleUid = payload.sub;

const existingGoogleUser = await client.query(
`SELECT stbx_uid
FROM users
WHERE google_uid = $1`,
[finalGoogleUid]
);

if (existingGoogleUser.rows.length > 0) {
await client.query("ROLLBACK");

return res.status(409).json({
success: false,
message: "This Google account is already linked to a StabiX account",
stbx_uid: existingGoogleUser.rows[0].stbx_uid
});
}
}

const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

const result = await client.query(
`INSERT INTO users
(stbx_uid, google_uid, username, eoa_address, password)
VALUES ($1, $2, $3, $4, $5)
RETURNING *`,
[stbx_uid, finalGoogleUid, username, eoa_address, hashedPassword]
);

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


const googleLogin = async (req, res) => {
try {
const { id_token } = req.body;

if (!id_token) {
return res.status(400).json({
success: false,
message: "Google ID token required"
});
}

const ticket = await googleClient.verifyIdToken({
idToken: id_token,
audience: process.env.GOOGLE_CLIENT_ID
});

const payload = ticket.getPayload();
const google_uid = payload.sub;

const result = await pool.query(
`SELECT
stbx_uid,
google_uid,
username
FROM users
WHERE google_uid = $1`,
[google_uid]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "No StabiX account found with this Google account."
});
}

const token = generateToken({
stbx_uid: result.rows[0].stbx_uid,
username: result.rows[0].username
});

return res.status(200).json({
success: true,
user: result.rows[0],
token
});

} catch (err) {
console.error(err);

return res.status(401).json({
success: false,
message: "Invalid Google ID token"
});
}
};



const updateEOAAddress = async (req, res) => {
try {
const { stbx_uid, eoa_address } = req.body;

const result = await pool.query(
`UPDATE users
SET eoa_address = $1
WHERE stbx_uid = $2
RETURNING eoa_address`,
[eoa_address, stbx_uid]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "User not found"
});
}

return res.status(200).json({
success: true,
message: "Wallet address updated successfully."
});
} catch (err) {
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};

const resetPassword = async (req, res) => {
try {
const { stbx_uid, password } = req.body;

if (!stbx_uid || !password) {
return res.status(400).json({
success: false,
message: "StabiX ID and password are required"
});
}

if (password.length < 6) {
return res.status(400).json({
success: false,
message: "Password must be at least 6 characters"
});
}

const hashedPassword = await bcrypt.hash(password, 10);

const result = await pool.query(
`UPDATE users
SET password = $1
WHERE stbx_uid = $2
RETURNING stbx_uid`,
[hashedPassword, stbx_uid]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "User not found"
});
}

return res.status(200).json({
success: true,
message: "Password updated successfully"
});

} catch (err) {
console.error(err);

return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};

module.exports = {loginUser, registerUser, getUser, getProfile, updateUsername,googleLogin, updateEOAAddress, resetPassword}
