const pool = require("../config/db");
const {creditBalance} = require("./balanceController");

const approveDeposit = async (req, res) => {

  const client = await pool.connect();
  try {
await client.query("BEGIN");

    const { STRId } = req.params;

   const deposit = await client.query(
  `SELECT *
   FROM deposits
   WHERE "STRId" = $1
   FOR UPDATE`,
  [STRId]
  );
    if (deposit.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found"
      });
    }

    if (deposit.rows[0].status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Deposit already processed"
      });
    }

    await client.query(
      `INSERT INTO wallet_balances
       (stbx_uid, asset, balance)
       VALUES ($1, $2, 0)
       ON CONFLICT (stbx_uid, asset)
       DO NOTHING`,
      [
        deposit.rows[0].stbx_uid,
        deposit.rows[0].asset
      ]
    );

    await creditBalance(
      client,
      deposit.rows[0].stbx_uid,
      deposit.rows[0].asset,
      deposit.rows[0].amount
    );

    await client.query(
      `UPDATE deposits
       SET status = 'APPROVED',
           updated_at = NOW()
       WHERE "STRId" = $1`,
      [STRId]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Deposit approved successfully.",
      STRId: STRId
    });

  } catch (err) {

    await client.query("ROLLBACK");

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  } finally {

    client.release();

  }
};
     


const rejectDeposit = async (req, res) => {

const client = await pool.connect();
try {
await client.query("BEGIN");

const { STRId } = req.params;

const deposit = await client.query(
`SELECT *
FROM deposits
WHERE "STRId" = $1
FOR UPDATE`,
[STRId]
);

if (deposit.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Deposit not found"
});
}

if (deposit.rows[0].status !== "PENDING") {
return res.status(400).json({
success: false,
message: "Deposit already processed"
});
}

await client.query(
`UPDATE deposits
SET status = 'REJECTED',
updated_at = NOW()
WHERE "STRId" = $1`,
[STRId]
);

await client.query("COMMIT");

return res.status(200).json({
success: true,
message: "Deposit rejected successfully.",
STRId: STRId
});
} catch (err) {
await client.query("ROLLBACK");
console.error(err);

return res.status(500).json({
success: false,
message: "Internal Server Error"
});

} finally {
client.release();
}
};


const approveWithdraw = async (req, res) => {
const client = await pool.connect();

try {
await client.query("BEGIN");

const { STRId } = req.params;

const withdraw = await client.query(
  `SELECT *
   FROM withdraws
   WHERE "STRId" = $1
   FOR UPDATE`,
  [STRId]
);

if (withdraw.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Withdraw not found"
});
}

if (withdraw.rows[0].status !== "PENDING") {
return res.status(400).json({
success: false,
message: "Withdraw already processed"
});
}

await client.query(
`UPDATE withdraws
SET status = 'APPROVED',
updated_at = NOW()
WHERE "STRId" = $1`,
[STRId]
);

await client.query("COMMIT");
return res.status(200).json({
success: true,
message: "Withdraw approved successfully.",
STRId: STRId
});

} catch (err) {
await client.query("ROLLBACK");
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});

} finally {
client.release();
}
};

const rejectWithdraw = async (req, res) => {

const client = await pool.connect();
try {

await client.query("BEGIN");
const { STRId } = req.params;

const withdraw = await client.query(
`SELECT *
FROM withdraws
WHERE "STRId" = $1
FOR UPDATE`,
[STRId]
);

if (withdraw.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Withdraw not found"
});
}

if (withdraw.rows[0].status !== "PENDING") {
return res.status(400).json({
success: false,
message: "Withdraw already processed"
});
}

await creditBalance(
  client,
  withdraw.rows[0].stbx_uid,
  withdraw.rows[0].asset,
  withdraw.rows[0].amount
);

await client.query(
`UPDATE withdraws
SET status = 'REJECTED',
updated_at = NOW()
WHERE "STRId" = $1`,
[STRId]
);

await client.query("COMMIT");
return res.status(200).json({
success: true,
message: "Withdraw rejected successfully.",
STRId: STRId
});

} catch (err) {
await client.query("ROLLBACK");
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});

} finally {
client.release();
}
};

const getPendingDeposits = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        "STRId",
        stbx_uid,
        asset,
        mode,
        network,
        amount,
        blockchain_tx_hash,
        created_at
      FROM deposits
      WHERE status = 'PENDING'
      ORDER BY created_at ASC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      deposits: result.rows
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

const getPendingWithdraws = async (req, res) => {
try {

const result = await pool.query(
       `SELECT
        "STRId",
        stbx_uid,
        asset,
        mode,
        network,
        amount,
        wallet_address,
        status,
        created_at
      FROM withdraws
      WHERE status = 'PENDING'
      ORDER BY created_at ASC`
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      withdraws: result.rows
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

const getPendingRequests = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        "STRId",
        stbx_uid,
        asset,
        mode,
        network,
        amount,
        blockchain_tx_hash,
        NULL::text AS wallet_address,
        'deposit' AS type,
        status,
        created_at
      FROM deposits
      WHERE status = 'PENDING'

      UNION ALL

      SELECT
        "STRId",
        stbx_uid,
        asset,
        mode,
        network,
        amount,
        NULL::text AS blockchain_tx_hash,
        wallet_address,
        'withdraw' AS type,
        status,
        created_at
      FROM withdraws
      WHERE status = 'PENDING'

      ORDER BY created_at ASC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      requests: result.rows
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};

const getAllUsers = async (req, res) => {
  try {

    const result = await pool.query(`
      SELECT
        username,
        stbx_uid,
        eoa_address
      FROM users
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      users: result.rows
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};

const getUserBalance = async (req, res) => {
  try {

    const { stbx_uid } = req.params;

    const result = await pool.query(
      `
      SELECT
        asset,
        balance
      FROM wallet_balances
      WHERE stbx_uid = $1
      `,
      [stbx_uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User balance not found"
      });
    }

    return res.status(200).json({
      success: true,
      stbx_uid,
      balances: result.rows
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
};

module.exports = {
approveDeposit,
rejectDeposit,
approveWithdraw,
rejectWithdraw,
getPendingDeposits,
getPendingWithdraws,
getPendingRequests,
getAllUsers,
getUserBalance
};
