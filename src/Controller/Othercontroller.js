import ApiResponse from "../Utils/Apiresponse.js";
const Checkingauthorizaion = async (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, "True", "User verified safely and securely"));
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Having error in the verifing user ${error}` });
  }
};

export { Checkingauthorizaion };
