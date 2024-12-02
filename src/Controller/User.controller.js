import ApiResponse from "../Utils/Apiresponse.js";
const creatingnewtrip = async (req, res) => {
    console.log("Saving our document");
    res.status(200).json(
        new ApiResponse(200, "hello", 'chudai karao ya na mujjhse karao')
    )
};
export {creatingnewtrip}