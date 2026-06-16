import express from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { authMiddleware } from "../middleware";
import { SigninSchema, SignupSchema } from "../lib/types";

const router = express.Router();

//signup
router.post("/signup", async (req, res) => {
  const result = SignupSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Inavlid Credentials" });
  }
  try {
    const { email, username, password } = result.data;
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (user) {
      res.status(404).json({ message: "user already exists" });
      return;
    }
    const hashedPassword = bcrypt.hashSync(password, 10);

    //New user Creation
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    if (!newUser) {
      res.status(404).json({ message: "Error while signinup" });
      return;
    }

    //Creating JWT Token
    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET!);

    //Setting Cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({ token, message: "Signup Successfully" });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Intenal Error" });
    return;
  }
});

//signin
router.post("/signin", async (req, res) => {
  const result = SigninSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Inavlid Credentials" });
  }
  try {
    const { username, password } = result.data;
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "user doesn't exists" });
    }

    //Password Validation
    const isPasswordCorrect = bcrypt.compareSync(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(404).json({ message: "Invalid Password" });
    }

    //Creating JWT Token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!);

    //Setting Cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({ token, message: "Signin Successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal Error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        username: true,
        email: true,
      },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: false });
  res.status(200).json({
    message: "Logged out successfully",
  });
});

export default router;
