const pool = require("../config/db");

const createDeposit = async (req, res) => {

const client = await pool.connect();
try {
await client.query("BEGIN");

const {
asset,
mode,
network,
amount,
blockchain_tx_hash
} = req.body;
const stbx_uid =req.user.stbx_uid;

const user = await client.query(
"SELECT stbx_uid FROM users WHERE stbx_uid = $1",
[stbx_uid]
);

if (user.rows.length === 0) {
return res.status(404).json({
success: false,
message: "User not found"
});
}

if (!["USDT", "USDC"].includes(asset)) {
return res.status(400).json({
success: false,
message: "Unsupported asset"
});
}

if (!["instant", "advanced"].includes(mode)) {
return res.status(400).json({
success: false,
message: "Invalid deposit mode"
});
}

if (![
"Ethereum (Testnet)",
"Arbitrum (Testnet)",
"Polygon (Testnet)",
"Base (Testnet)",
"Tron (Testnet)"
].includes(network)) {
return res.status(400).json({
success: false,
message: "Unsupported network"
});
}

if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
  return res.status(400).json({
    success: false,
    message: "Invalid amount"
  });
}
if (
  typeof blockchain_tx_hash !== "string" ||
  blockchain_tx_hash.trim().length === 0
) {
  return res.status(400).json({
    success: false,
    message: "Blockchain transaction hash is required"
  });
}
if (!/^0x[a-fA-F0-9]{64}$/.test(blockchain_tx_hash.trim())) {
  return res.status(400).json({
    success: false,
    message: "Invalid blockchain transaction hash"
  });
}
await client.query("BEGIN");

const STRId =
"STR" +
Date.now() +
Math.floor(Math.random() * 1000);

await client.query(
`INSERT INTO deposits
(
"STRId",
stbx_uid,
asset,
mode,
network,
amount,
blockchain_tx_hash,
status
)
VALUES
(
$1,$2,$3,$4,$5,$6,$7,$8
)`,
[
STRId,
stbx_uid,
asset,
mode,
network,
amount,
blockchain_tx_hash,
"PENDING"
]
);

await client.query("COMMIT");
return res.status(201).json({
success: true,
message: "Deposit request submitted.",
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


const getDepositAddress = async (req, res) => {
  try {
    const stbx_uid = req.user.stbx_uid;

  const network =
  req.query.network?.toLowerCase() || "ethereum";
  const mode =
  req.query.mode?.toLowerCase() || "instant";
if (!["instant", "advanced"].includes(mode)) {
  return res.status(400).json({
    success: false,
    message: "Invalid deposit mode"
  });
}
if (
  !["ethereum", "arbitrum", "bnb", "tron"].includes(network)
) {
  return res.status(400).json({
    success: false,
    message: "Unsupported network"
  });
}

    const userResult = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1`,
      [stbx_uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userId = userResult.rows[0].id;

    const {
      getOrCreateDepositAddress
    } = require("../services/depositAddressService");

   const depositAddress =
  await getOrCreateDepositAddress(
    userId,
    network,
    mode
  );

   return res.status(200).json({
  success: true,
  network,
  mode,
  address: depositAddress.address,
  addressId: depositAddress.id
});

  } catch (err) {
    console.error(
      "GET DEPOSIT ADDRESS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Unable to get deposit address"
    });
  }
};


const getDepositHistory = async (req, res) => {
try {
const stbx_uid = req.user.stbx_uid;

const result = await pool.query(
`SELECT
STRId,
asset,
mode,
network,
amount,
blockchain_tx_hash,
status,
created_at
FROM deposits
WHERE stbx_uid = $1
ORDER BY created_at DESC`,
[stbx_uid]
);

return res.status(200).json({
success: true,
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

const getDepositById = async (req, res) => {
try {
const { STRId } = req.params;
const stbx_uid = req.user.stbx_uid;

const result = await pool.query(
`SELECT *
FROM deposits
WHERE "STRId" = $1
AND stbx_uid = $2`,
[STRId, stbx_uid]
);

if (result.rows.length === 0) {
return res.status(404).json({
success: false,
message: "Deposit not found"
});
}

return res.status(200).json({
success: true,
deposit: result.rows[0]
});

} catch (err) {
console.error(err);
return res.status(500).json({
success: false,
message: "Internal Server Error"
});
}
};

const createDepositIntent = async (req, res) => {
  try {
    const stbx_uid = req.user.stbx_uid;

    const {
      asset,
      mode,
      network
    } = req.body;

    if (!["USDT", "USDC"].includes(asset)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported asset"
      });
    }

    if (!["instant", "advanced"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit mode"
      });
    }

    if (!["ethereum", "bnb", "arbitrum", "tron"].includes(network)) {
      return res.status(400).json({
        success: false,
        message: "Unsupported network"
      });
    }

    const userResult = await pool.query(
      `SELECT id
       FROM users
       WHERE stbx_uid = $1
       LIMIT 1`,
      [stbx_uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userId = userResult.rows[0].id;

    const chainIds = {
    ethereum: 11155111,
    bnb: 97,
    arbitrum: 421614,
    tron: 3448148188,
    };

const chainId = chainIds[network];

   const result = await pool.query(
  `INSERT INTO deposit_intents
   (
     user_id,
     asset,
     mode,
     network,
     chain_id,
     status
   )
   VALUES ($1, $2, $3, $4, $5, 'pending')
   RETURNING
     id,
     user_id,
     asset,
     mode,
     network,
     chain_id,
     deposit_address_id,
     status,
     created_at`,
  [
    userId,
    asset,
    mode,
    network,
    chainId
  ]
);

    return res.status(201).json({
      success: true,
      intent: result.rows[0]
    });

  } catch (err) {
    console.error(
      "CREATE DEPOSIT INTENT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Unable to create deposit intent"
    });
  }
};

const attachDepositIntentAddress = async (req, res) => {
  try {
    const stbx_uid = req.user.stbx_uid;
    const { intentId, depositAddressId } = req.body;

    if (!intentId || !depositAddressId) {
      return res.status(400).json({
        success: false,
        message: "intentId and depositAddressId are required"
      });
    }

    const result = await pool.query(
      `UPDATE deposit_intents di
       SET
         deposit_address_id = da.id,
         updated_at = CURRENT_TIMESTAMP
       FROM deposit_addresses da
       INNER JOIN users u
         ON u.id = da.user_id
       WHERE di.id = $1
         AND da.id = $2
         AND u.stbx_uid = $3
         AND da.status = 'active'
         AND da.network = di.network
       RETURNING
         di.id,
         di.user_id,
         di.asset,
         di.mode,
         di.network,
         di.chain_id,
         di.deposit_address_id,
         di.status`,
      [
        intentId,
        depositAddressId,
        stbx_uid
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Deposit intent or matching address not found"
      });
    }

    return res.status(200).json({
      success: true,
      intent: result.rows[0]
    });

  } catch (err) {
    console.error(
      "ATTACH DEPOSIT INTENT ADDRESS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: "Unable to attach deposit address"
    });
  }
};

module.exports = {
createDeposit,
getDepositAddress,
getDepositHistory,
getDepositById,
createDepositIntent,
attachDepositIntentAddress,
};
