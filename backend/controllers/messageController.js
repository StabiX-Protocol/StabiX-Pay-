const pool = require("../config/db");
const emitNewMessage = (req, message) => {
  const io = req.app.get("io");

  if (!io) return;

  io.to(`user:${message.receiver_id}`).emit(
    "message:new",
    message
  );

  io.to(`user:${message.sender_id}`).emit(
    "message:new",
    message
  );
};

const sendMessage = async (req, res) => {
  try {
    const senderUid = req.user.stbx_uid;
    const { receiver_stbx_uid, message } = req.body;

    if (!receiver_stbx_uid) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required"
      });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty"
      });
    }

    const senderResult = await pool.query(
      `SELECT id, stbx_uid
       FROM users
       WHERE stbx_uid = $1`,
      [senderUid]
    );

    if (senderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Sender not found"
      });
    }

    const receiverResult = await pool.query(
      `SELECT id, stbx_uid
       FROM users
       WHERE stbx_uid = $1`,
      [receiver_stbx_uid]
    );

    if (receiverResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found"
      });
    }

    const senderId = senderResult.rows[0].id;
    const receiverId = receiverResult.rows[0].id;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself"
      });
    }

    // Block check
    const blockResult = await pool.query(
      `SELECT id
       FROM user_blocks
       WHERE
         (blocker_id = $1 AND blocked_id = $2)
         OR
         (blocker_id = $2 AND blocked_id = $1)
       LIMIT 1`,
      [senderId, receiverId]
    );

    if (blockResult.rows.length > 0) {
      return res.status(403).json({
        success: false,
        message: "Messaging is unavailable for this user"
      });
    }

    const result = await pool.query(
      `INSERT INTO messages
       (sender_id, receiver_id, message)
       VALUES ($1, $2, $3)
       RETURNING
         id,
         sender_id,
         receiver_id,
         message,
         created_at,
         seen_at,
         deleted_at`,
      [senderId, receiverId, message.trim()]
    );

    return res.status(201).json({
      success: true,
      message: result.rows[0]
    });

    emitNewMessage(req, result.rows[0]);

  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to send message"
    });
  }
};


const getMessages = async (req, res) => {
  try {
    const currentUid = req.user.stbx_uid;
    const otherUid = req.params.stbx_uid;

    const currentUserResult = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1`,
      [currentUid]
    );

    if (currentUserResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Current user not found"
      });
    }

    const otherUserResult = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1`,
      [otherUid]
    );

    if (otherUserResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const currentUserId = currentUserResult.rows[0].id;
    const otherUserId = otherUserResult.rows[0].id;

    const result = await pool.query(
      `SELECT
         id,
         sender_id,
         receiver_id,
         message,
         created_at,
         seen_at,
         deleted_at
       FROM messages
       WHERE
         (sender_id = $1 AND receiver_id = $2)
         OR
         (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC, id ASC`,
      [currentUserId, otherUserId]
    );

    return res.status(200).json({
      success: true,
      messages: result.rows
    });

  } catch (err) {
    console.error("GET MESSAGES ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to load messages"
    });
  }
};


const markMessagesSeen = async (req, res) => {
  try {
    const currentUid = req.user.stbx_uid;
    const otherUid = req.params.stbx_uid;

    const currentUserResult = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1`,
      [currentUid]
    );

    const otherUserResult = await pool.query(
      `SELECT id
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
        message: "User not found"
      });
    }

    const currentUserId = currentUserResult.rows[0].id;
    const otherUserId = otherUserResult.rows[0].id;

    const seenResult = await pool.query(
  `UPDATE messages
   SET seen_at = CURRENT_TIMESTAMP
   WHERE sender_id = $1
   AND receiver_id = $2
   AND seen_at IS NULL
   AND deleted_at IS NULL
   RETURNING id, seen_at`,
  [otherUserId, currentUserId]
);
const io = req.app.get("io");
if (io && seenResult.rows.length > 0) {
io.to(`user:${otherUserId}`).emit(
"messages:seen",
{
message_ids: seenResult.rows.map(
        (row) => row.id
      ),
      seen_at: seenResult.rows[0].seen_at,
    }
  );
}

    return res.status(200).json({
      success: true,
      message: "Messages marked as seen"
    });

  } catch (err) {
    console.error("MARK MESSAGE SEEN ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to mark messages as seen"
    });
  }
};


const deleteMessage = async (req, res) => {
  try {
    const currentUid = req.user.stbx_uid;
    const messageId = req.params.id;

    const userResult = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1`,
      [currentUid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userId = userResult.rows[0].id;

    const result = await pool.query(
      `UPDATE messages
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = $1
       AND sender_id = $2
       AND deleted_at IS NULL
       RETURNING id, deleted_at`,
      [messageId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted",
      deleted_message: result.rows[0]
    });

  } catch (err) {
    console.error("DELETE MESSAGE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Unable to delete message"
    });
  }
};


module.exports = {
  sendMessage,
  getMessages,
  markMessagesSeen,
  deleteMessage
};