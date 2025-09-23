const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

      const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });

        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ error: "Forbidden: no access" });
        }

        req.user = decoded;
        next();
      });
    } catch (err) {
      res.status(401).json({ error: "Unauthorized" });
    }
  };
};