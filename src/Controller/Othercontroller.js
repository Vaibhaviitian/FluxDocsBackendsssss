import ApiResponse from "../Utils/Apiresponse.js";
const other = async (req, res) => {
  try {
    res
      .status(200)
      .json(new ApiResponse(200, "SEX", "User registered successfully"));
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Having error in the registering user ${error}` });
  }
};

export { other };
