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
  if (!title || !docid || !user_id) {
    return res.status(400).json({
      message: "Please provide all required fields: title, docid, and user_id.",
    });
  }

  try {
    const doc = await DocumentModel.findById(docid);
    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    if (!doc.owner) {
      doc.owner = user_id; 
    } else if (doc.owner.toString() !== user_id) {
      return res.status(403).json({
        message: "Only the owner of the document can edit it.",
      });
    }
    doc.title = title;
    await doc.save();
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
