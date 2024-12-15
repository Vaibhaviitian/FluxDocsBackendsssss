import ApiResponse from "../Utils/Apiresponse.js";
const userverified = async (req, res) => {
    try {
      res
        .status(200)
        .json(new ApiResponse(200, "Token Verifeid successfully"));
    } catch (error) {
      return res
        .status(404)
        .json({ message: `Having error in the verifying user ${error}` });
    }
  };

export {userverified}