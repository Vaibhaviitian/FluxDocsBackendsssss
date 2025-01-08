import { DocumentModel } from "../Models/Document.model.js";
import { requestmodel } from "../Models/Request.model.js";
import { UserModel } from "../Models/User.model.js";
import ApiResponse from "../Utils/Apiresponse.js";
const creatingcollabrequests = async (req, res) => {
  try {
    const { user_id, doc_id, permission } = req.body;
    console.log(user_id, doc_id, permission);

    if (!user_id || !doc_id) {
      return res.status(404).json({ message: `Provide all details properly` });
    }

    const document = await DocumentModel.findById(doc_id);
    console.log(document);
    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or does not exist" });
    }

    if (!Array.isArray(document.requests)) {
      document.requests = [];
    }
    const existingRequest = await requestmodel.findOne({
      _id: { $in: document.requests },
      requester: user_id,
      status: "pending",
    });
    console.log(document.owner);

    if (existingRequest) {
      return res
        .status(200)
        .json({ message: "Request sent already", status: "Pending..." });
    }

    const isAlreadyCollaborator = document.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === user_id &&
        collaborator.permission.toString() === permission.toString()
    );
    console.log(isAlreadyCollaborator);
    if (isAlreadyCollaborator) {
      console.log(isAlreadyCollaborator);
      return res.status(200).json({
        message: "You already have this permission.",
        status: "Pending...",
      });
    }

    const newRequest = await requestmodel.create({
      document: doc_id,
      requester: user_id,
      owner: document.owner,
      permission,
      status: "pending",
    });

    const sender = await UserModel.findById(user_id);
    sender.sentRequests.push(newRequest._id);
    console.log(document.owner);
    const receiver = await UserModel.findById(document.owner);
    console.log(receiver);
    receiver.receivedRequests.push(newRequest._id);

    document.requests.push(newRequest._id);

    await document.save();
    await sender.save();
    await receiver.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          newRequest,
          "Collaboration request sent successfully"
        )
      );
  } catch (error) {
    return res.status(500).json({
      message: `Having error while creating collaboration request: ${error.message}`,
    });
  }
};

const handlerequest = async (req, res) => {
  const { action, request_id, user_id } = req.body;
  console.log(action, request_id, user_id);
  if (!request_id || !action) {
    return res.status(400).json({ message: "Provide all details properly." });
  }

  const request = await requestmodel.findById(request_id);
  if (!request) {
    return res.status(404).json({ message: "Request not found." });
  }

  const document = await DocumentModel.findById(request.document);
  console.log(document);
  if (document.owner.toString() !== user_id.toString()) {
    return res
      .status(403)
      .json({ message: "You are not authorized to handle this request." });
  }

  if (action.toString() === "accepted") {
    console.log("ACceptin.......");
    document.collaborators.push({
      user: request.requester,
      permission: "edit",
    });

    request.status = "accepted";
    request.permission = "edit";

    await document.save();
    await request.save();

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          request,
          "Collaboration request accepted successfully."
        )
      );
  } else if (action.toString() === "rejected") {
    console.log("rejecttingggggggggg");
    request.permission = "view";
    document.collaborators.push({
      user: request.requester,
      permission: "view",
    });
    request.status = "rejected";
    await request.save();
    await document.save();

    res
      .status(200)
      .json(new ApiResponse(200, request, "Collaboration request rejected."));
  } else {
    return res
      .status(400)
      .json({ message: "Invalid action. Please choose 'accept' or 'reject'." });
  }
};

const getUserRequests = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const requests = await requestmodel
      .find({
        $or: [{ owner: user_id }],
      })
      .populate("owner")
      .populate("requester");

    if (!requests || requests.length === 0) {
      return res.status(200).json({
        message: "No recieved requests found for this user",
        data: [],
      });
    }

    return res.status(200).json({
      message: "recieved Requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching requests: ${error.message}` });
  }
};

const sended_request = async (req, res) => {
  try {
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const requests = await requestmodel
      .find({
        $or: [{ requester: user_id }],
      })
      .populate("owner")
      .populate("requester");

    if (!requests || requests.length === 0) {
      return res.status(200).json({
        message: "No sended requests found for this user",
        data: [],
      });
    }
    return res.status(200).json({
      message: "sended Requests fetched successfully",
      data: requests,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching requests: ${error.message}` });
  }
};

const delete_doc = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(404).json({ message: "Doc Id not found" });
    }
    const doc = await DocumentModel.findOneAndDelete({ _id: id });
    console.log(doc);
    if (!doc) {
      return res.status(404).json({ message: "Doc not found" });
    }

    return res.status(200).json({ message: "Doc deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error while deleting doc: ${error.message}` });
  }
};
const individual_doc = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(404).json({ message: "Doc Id not found" });
    }
    const doc = await DocumentModel.findById(id)
      .populate("collaborators.user") // This will populate the entire user object
      .exec();

    console.log(doc);
    if (!doc) {
      return res.status(404).json({ message: "Doc not found" });
    }

    return res.status(200).json({ message: doc });
  } catch (error) {
    return res.status(500).json({
      message: `Error while getting individual doc: ${error.message}`,
    });
  }
};
export {
  creatingcollabrequests,
  handlerequest,
  getUserRequests,
  sended_request,
  delete_doc,
  individual_doc,
};
