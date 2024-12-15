import jwt from "jsonwebtoken";

const authtoken = async (req, res, next) => {
  console.log("Middleware Triggered: Checking Authorization...");
  const { Authorization } = req.body;

  if (!Authorization) {
    console.error("Authorization header is missing.");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    console.log("Received Authorization token:", Authorization);
    console.log("Using secret key for verification:", process.env.Authentication_for_jsonwebtoken);

    const decodedToken = jwt.verify(
      Authorization,
      process.env.Authentication_for_jsonwebtoken
    );
    console.log("Token successfully verified. Decoded payload:", decodedToken);
    req.user = decodedToken;
    console.log("Initial value of sexn name is ",req.user);
    console.log("User attached to request:", req.body);

    next(); 
  } catch (error) {
    console.error("Error occurred while verifying token:", error.message);
    console.error("Full error stack:", error);

    return res.status(403).json({
      message: `Invalid token: ${error.message}`,
    });
  }
};

export { authtoken };
