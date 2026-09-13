const pool = require("../config/db");

const blockUser = async (req, res) => {
  try {
    const blockerUid = req.user.stbx_uid;
    const { blocked_stbx_uid } = req.body;

    if (!blocked_stbx_uid) {
      return res.status(400).json({
        success: false,
        message: "User is required"
      });
    }

    const blockerResult = await pool.query(
      `SELECT id FROM users WHERE stbx_uid = $1`,
      [blockerUid]
    );

    const blockedResult = await pool.query(
      `SELECT id FROM users WHERE stbx_uid = $1`,
      [blocked_stbx_uid]
    );

    if (
      blockerResult.rows.length === 0 ||
      blockedResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const blockerId = blockerResult.rows[0].id;
    const blockedId = blockedResult.rows[0].id;

    if (blockerId === blockedId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself"
      });
    }

    await pool.query(
      `INSERT INTO user_blocks
       (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id)
       DO NOTHING`,
      [blockerId, blockedId]
    );

    return res.status(200).json({
      success: true,
      message: "User blocked"
    });

  } catch (err) {
    console.error("BLOCK USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to block user"
    });
  }
};

const unblockUser = async (req, res) => {
  try {
    const blockerUid = req.user.stbx_uid;
    const { blocked_stbx_uid } = req.body;

    const blockerResult = await pool.query(
      `SELECT id FROM users WHERE stbx_uid = $1`,
      [blockerUid]
    );

    const blockedResult = await pool.query(
      `SELECT id FROM users WHERE stbx_uid = $1`,
      [blocked_stbx_uid]
    );

    if (
      blockerResult.rows.length === 0 ||
      blockedResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await pool.query(
      `DELETE FROM user_blocks
       WHERE blocker_id = $1
       AND blocked_id = $2`,
      [
        blockerResult.rows[0].id,
        blockedResult.rows[0].id
      ]
    );

    return res.status(200).json({
      success: true,
      message: "User unblocked"
    });

  } catch (err) {
    console.error("UNBLOCK USER ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to unblock user"
    });
  }
};

const getBlockStatus = async (req, res) => {
  try {
    const blockerUid = req.user.stbx_uid;
    const blockedUid = req.params.stbx_uid;

    const result = await pool.query(
      `SELECT 1
       FROM user_blocks ub
       JOIN users blocker ON blocker.id = ub.blocker_id
       JOIN users blocked ON blocked.id = ub.blocked_id
       WHERE blocker.stbx_uid = $1
       AND blocked.stbx_uid = $2
       LIMIT 1`,
      [blockerUid, blockedUid]
    );

    return res.status(200).json({
      success: true,
      blocked: result.rows.length > 0
    });

  } catch (err) {
    console.error("GET BLOCK STATUS ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to check block status"
    });
  }
};

module.exports = {
  blockUser,
  unblockUser,
getBlockStatus
};