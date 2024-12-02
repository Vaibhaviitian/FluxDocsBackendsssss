import jwt from "jsonwebtoken";

const authtoken = async (req, res, next) => {
  const {Authorization} = req.headers;
  if (!Authorization) {
    return res.status(401).json({ message: "Authorization header missing" });
  }
  try {
    const decodedToken = jwt.verify(
    Authorization,
    process.env.AUTHENTICATION_SECRET_KEY
    );
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

export { authtoken };