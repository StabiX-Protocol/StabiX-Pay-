const pool = require("../config/db");

const blockUser = async (req, res) => {
  try {
    const blockerUid = req.user.stbx_uid;
    const blockedUid = req.body.blocked_stbx_uid;

    if (!blockedUid) {
      return res.status(400).json({
        success: false,
        message: "Blocked user UID required",
      });
    }

    const blockerResult = await pool.query(
      `SELECT id FROM users WHERE stbx_uid = $1`,
      [blockerUid]
    );

    const blockedResult = await pool.query(
      `SELECT id FROM users WHERE stbx_uid = $1`,
      [blockedUid]
    );

    if (
      blockerResult.rows.length === 0 ||
      blockedResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const blockerId = blockerResult.rows[0].id;
    const blockedId = blockedResult.rows[0].id;

    if (blockerId === blockedId) {
      return res.status(400).json({
        success: false,
        message: "You cannot block yourself",
      });
    }

    await pool.query(
      `INSERT INTO user_blocks (
        blocker_id,
        blocked_id
      )
      VALUES ($1, $2)
      ON CONFLICT (blocker_id, blocked_id)
      DO NOTHING`,
      [blockerId, blockedId]
    );

    return res.status(200).json({
      success: true,
      blocked: true,
    });

  } catch (error) {
    console.error("Block user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to block user",
    });
  }
};


const unblockUser = async (req, res) => {
  try {
    const blockerUid = req.user.stbx_uid;
    const blockedUid = req.body.blocked_stbx_uid;

    const result = await pool.query(
      `DELETE FROM user_blocks ub
       USING users blocker, users blocked
       WHERE ub.blocker_id = blocker.id
       AND ub.blocked_id = blocked.id
       AND blocker.stbx_uid = $1
       AND blocked.stbx_uid = $2`,
      [blockerUid, blockedUid]
    );

    return res.status(200).json({
      success: true,
      blocked: false,
    });

  } catch (error) {
    console.error("Unblock user error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to unblock user",
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
       JOIN users blocker
         ON blocker.id = ub.blocker_id
       JOIN users blocked
         ON blocked.id = ub.blocked_id
       WHERE blocker.stbx_uid = $1
       AND blocked.stbx_uid = $2
       LIMIT 1`,
      [blockerUid, blockedUid]
    );

    return res.status(200).json({
      success: true,
      blocked: result.rows.length > 0,
    });

  } catch (error) {
    console.error("Get block status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get block status",
    });
  }
};


module.exports = {
  blockUser,
  unblockUser,
  getBlockStatus,
};