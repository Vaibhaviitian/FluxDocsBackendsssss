import { DocumentModel } from "../Models/Document.model.js";
import { requestmodel } from "../Models/Request.model.js";
import ApiResponse from "../Utils/Apiresponse.js";
const creatingcollabrequests = async (req, res) => {
  try {
    const { user_id, doc_id, permission } = req.body;

    if (!user_id || !doc_id) {
      return res.status(404).json({ message: `Provide all details properly` });
    }

    const document = await DocumentModel.findById(doc_id);

    if (!document) {
      return res
        .status(404)
        .json({ message: "Document not found or does not exist" });
    }

    if (!Array.isArray(document.requests)) {
      document.requests = [];
    }
    const requests = await Promise.all(
      document.requests.map(async (requestId) => {
        const request = await requestmodel.findById(requestId);
        return request && request.status.toString() === "pending";
      })
    );

    if (requests.includes(true)) {
      return res
        .status(200)
        .json({ message: "Request sent already", status: "Pending..." });
    }
    const isAlreadyCollaborator = document.collaborators.some(
      (collaborator) =>
        collaborator.user.toString() === user_id &&
        collaborator.permission === permission
    );

    if (isAlreadyCollaborator) {
      return res.status(400).json({
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

    document.requests.push(newRequest._id);
    await document.save();

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
    document.collaborators.push({
      user: request.requester,
      permission: request.permission,
    });

    request.status = "accepted";

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
    request.status = "rejected";
    await request.save();

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
        message: "No collaboration requests found for this user",
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
      return res
        .status(404)
        .json({
          message: "No collaboration requests found for this user",
          data: [],
        });
    }
    return res.status(200).json({
      message: "sended Requests fetched successfully",
      data:requests
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error fetching requests: ${error.message}` });
  }
};

export {
  creatingcollabrequests,
  handlerequest,
  getUserRequests,
  sended_request,
};
