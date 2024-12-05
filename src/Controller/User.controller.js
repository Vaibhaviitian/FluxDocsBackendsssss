import { DocumentModel } from "../Models/Document.model.js";
import { UserModel } from "../Models/User.model.js";
import ApiResponse from "../Utils/Apiresponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const RegisterUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(username, email, password);
    const user = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (user) {
      return res.status(404).json({ message: "User exists already ,do login" });
    }
    const hashpassword = await bcrypt.hash(password, 10);
    const newuser = await UserModel.create({
      username,
      email,
      password: hashpassword,
    });
    const createduser = await UserModel.findById(newuser._id);
    if (!createduser) {
      return res
        .status(404)
        .json({ message: "Server issue while creating user" });
    }
    res
      .status(200)
      .json(new ApiResponse(200, createduser, "User registered successfully"));
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Having error in the registering user ${error}` });
  }
};

const LoginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({
    $or: [{ email }],
  });
  if (!user) {
    return res
      .status(404)
      .json({ message: "User is not exists in the database , do register " });
  }
  const ispasscorrect = await bcrypt.compare(password, user.password);
  console.log(ispasscorrect);
  if (!ispasscorrect) {
    return res.status(404).json({ message: "wrong password " });
  }
  const jsonewbestoken = jwt.sign(
    { email: user.email, _id: user.id },
    process.env.Authentication_for_jsonwebtoken,
    { expiresIn: "24h" }
  );
  res.status(200).json({
    message: "User login successfully",
    success: "true",
    user: user,
    jwttoken: jsonewbestoken,
  });
};

const saving_title = async (req, res) => {
  const { title, docid, user_id } = req.body;

  // Check for required fields
  if (!title || !docid || !user_id) {
    return res.status(400).json({
      message: "Please provide all required fields: title, docid, and user_id.",
    });
  }

  try {
    // Find the document by ID
    const doc = await DocumentModel.findById(docid);

    // If the document does not exist, return an error
    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Assign the logged-in user as the owner if this is the first save
    if (!doc.owner) {
      doc.owner = user_id; // Assign the owner only if it's not already set
    } else if (doc.owner.toString() !== user_id) {
      // If the logged-in user is not the owner, deny permission to edit
      return res.status(403).json({
        message: "Only the owner of the document can edit it.",
      });
    }

    // Update the document title
    doc.title = title;

    // Save the changes
    await doc.save();

    // Populate the owner field with the full user object instead of just the user_id
    const populatedDoc = await DocumentModel.findById(docid).populate("owner");

    return res.status(200).json({
      message: "Document title updated successfully.",
      doc: populatedDoc,
    });
  } catch (error) {
    console.error("Error updating document title:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { RegisterUser, LoginUser, saving_title };
