const pool = require("../config/db");

const getChatStatus = async (req, res) => {
  try {
    const currentUid = req.user.stbx_uid;
    const otherUid = req.params.stbx_uid;

    const currentUserResult = await pool.query(
      `SELECT id, username
       FROM users
       WHERE stbx_uid = $1`,
      [currentUid]
    );

    const otherUserResult = await pool.query(
      `SELECT id, username
       FROM users
       WHERE stbx_uid = $1`,
      [otherUid]
    );

    if (
      currentUserResult.rows.length === 0 ||
      otherUserResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = currentUserResult.rows[0];
    const otherUser = otherUserResult.rows[0];

    const settingsResult = await pool.query(
      `SELECT user_id, other_user_id, enabled
       FROM user_chat_settings
       WHERE
         (user_id = $1 AND other_user_id = $2)
         OR
         (user_id = $2 AND other_user_id = $1)`,
      [currentUser.id, otherUser.id]
    );

    let youDisabled = false;
    let otherDisabled = false;

    for (const setting of settingsResult.rows) {
      if (
        setting.user_id === currentUser.id &&
        setting.other_user_id === otherUser.id
      ) {
        youDisabled = setting.enabled === false;
      }

      if (
        setting.user_id === otherUser.id &&
        setting.other_user_id === currentUser.id
      ) {
        otherDisabled = setting.enabled === false;
      }
    }

    let disabledBy = null;
    let disabledByUsername = null;

    if (youDisabled) {
      disabledBy = "you";
    } else if (otherDisabled) {
      disabledBy = "other";
      disabledByUsername = otherUser.username;
    }

    return res.status(200).json({
      success: true,
      chat_enabled: !youDisabled && !otherDisabled,
      disabled_by: disabledBy,
      disabled_by_username: disabledByUsername,
      you_disabled: youDisabled,
      other_disabled: otherDisabled,
    });

  } catch (error) {
    console.error("Get chat status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get chat status",
    });
  }
};


const setChatStatus = async (req, res) => {
  try {
    const currentUid = req.user.stbx_uid;
    const { other_stbx_uid, enabled } = req.body;

    if (!other_stbx_uid) {
      return res.status(400).json({
        success: false,
        message: "Other user UID required",
      });
    }

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Enabled must be boolean",
      });
    }

    const currentUserResult = await pool.query(
      `SELECT id, username
       FROM users
       WHERE stbx_uid = $1`,
      [currentUid]
    );

    const otherUserResult = await pool.query(
      `SELECT id, username
       FROM users
       WHERE stbx_uid = $1`,
      [other_stbx_uid]
    );

    if (
      currentUserResult.rows.length === 0 ||
      otherUserResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = currentUserResult.rows[0];
    const otherUser = otherUserResult.rows[0];

    if (currentUser.id === otherUser.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change chat settings for yourself",
      });
    }

    await pool.query(
      `INSERT INTO user_chat_settings (
        user_id,
        other_user_id,
        enabled,
        updated_at
      )
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)

      ON CONFLICT (user_id, other_user_id)

      DO UPDATE SET
        enabled = EXCLUDED.enabled,
        updated_at = CURRENT_TIMESTAMP`,
      [
        currentUser.id,
        otherUser.id,
        enabled,
      ]
    );

    return res.status(200).json({
      success: true,
      enabled,
    });

  } catch (error) {
    console.error("Set chat status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update chat status",
    });
  }
};


module.exports = {
  getChatStatus,
  setChatStatus,
};