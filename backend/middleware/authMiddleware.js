const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
try {

const authHeader = req.headers.authorization;
if (!authHeader) {
return res.status(401).json({
success: false,
message: "Token required"
});
}

const token = authHeader.split(" ")[1];

const decoded = jwt.verify(
token,
process.env.JWT_SECRET
);
req.user = decoded;
next();

} catch (err) {

return res.status(401).json({
success: false,
message: "Invalid token"
});
}
};

module.exports = {
verifyToken
};