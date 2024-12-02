import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rooter from "./Routes/user.routes.js";
const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "20kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "20kb",
  })
);
app.use(cookieParser());
console.log("We had injected cookie parser");
app.use(express.static("Public"));

app.use("/user", rooter);

export { app };
