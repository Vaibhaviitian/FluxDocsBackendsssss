import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./src/DB/index.db.js";
import { DocumentModel } from "./src/Models/Document.model.js";
import { app } from "./app.js";

dotenv.config();
app.use(cors());
app.use(express.json());

const services = createServer(app);
const io = new Server(services, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const documents = {};
const active_users_ondoc = {};

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    try {
      const data = await findOrCreateDocument(documentId);
      console.log(documentId);
      socket.join(documentId);
      socket.emit("load-document", data);
      socket.on("selection-change", (data) => {
        const { documentId, userName, cursorPosition, highlightedText } = data;
        console.log(`${userName} is interacting with document ${documentId}`);
        if (cursorPosition !== null) {
          console.log(`${userName} cursor is at position: ${cursorPosition}`);
        }
        if (highlightedText) {
          console.log(`${userName} highlighted text: "${highlightedText}"`);
        }
        socket.broadcast.to(documentId).emit("user-selection-update", data);
      });
      socket.on("send-changes", (delta) => {
        socket.broadcast.to(documentId).emit("receive-changes", delta);
      });

      socket.on("save-changes", async (data) => {
        try {
          await DocumentModel.findByIdAndUpdate(
            documentId,
            { data: data },
            { new: true, upsert: true }
          );
          // console.log("Document saved successfully");
        } catch (error) {
          console.error("Error saving document:", error);
        }
      });
    } catch (error) {
      console.error("Document retrieval error:", error);
    }
  });
  socket.on("join-document", ({ documentId, userID, userName }) => {
    if (!active_users_ondoc[documentId]) {
      active_users_ondoc[documentId] = [];
    }
    active_users_ondoc[documentId].push({
      userID,
      userName,
      socketId: socket.id,
    });

    console.log(`${userName} joined document ${documentId}`);

    io.to(documentId).emit("active-users", active_users_ondoc[documentId]);

    socket.join(documentId);
  });
  socket.on("disconnect", () => {
    for (const documentId in active_users_ondoc) {
      active_users_ondoc[documentId] = active_users_ondoc[documentId].filter(
        (user) => user.socketId !== socket.id
      );
      io.to(documentId).emit("active-users", active_users_ondoc[documentId]);
    }
    console.log(`Socket disconnected: ${socket.id}`);
  });
  socket.on("sending-message", (message, callback) => {
    console.log("Received message from client:", message.chatMessage);
    console.log("Received message from client:", message.userName);

    // Correct event name
    socket.broadcast.emit("new-message-to-all", message);

    if (callback) {
      callback("Message received successfully");
    }
  }); 
});

const findOrCreateDocument = async (id) => {
  if (!id) return null;

  const document = await DocumentModel.findById(id);
  if (document) return document;

  return await DocumentModel.create({
    _id: id,
    data: { ops: [{ insert: "" }] },
  });
};

connectDB()
  .then(() => {
    services.listen(process.env.PORT || 1000, () => {
      console.log(`⚙️ Server is running at port: ${process.env.PORT || 1000}`);
    });
  })
  .catch((err) => {
    console.error(`MongoDB connection error: ${err}`);
  });
