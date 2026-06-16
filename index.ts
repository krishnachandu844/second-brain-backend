import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import user from "./src/routes/user";
import content from "./src/routes/content";

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/v1", user);
app.use("/api/v1", content);

app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});
