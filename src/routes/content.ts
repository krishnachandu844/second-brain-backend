import express from "express";
import { authMiddleware } from "../middleware";
import { prisma } from "../../lib/prisma";
import { Type } from "../../generated/prisma/enums";
import { ContentSchema } from "../lib/types";

const router = express.Router();

//addding content
router.post("/addcontent", authMiddleware, async (req, res) => {
  const result = ContentSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ message: "Inavlid Data" });
  }

  const userId = req.userId;
  try {
    const { title, type, link, description } = result.data;
    const newContent = await prisma.content.create({
      data: {
        title,
        link,
        type: type as Type,
        description,
        userId,
      },
    });

    if (!newContent)
      return res.status(404).json({ messsage: "unable to add content" });
    return res.status(200).json({ messsage: "content added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal Error" });
  }
});

// Get all contents of separate user
router.get("/getcontent", authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const contents = await prisma.content.findMany({
      where: {
        userId,
      },
    });
    if (!contents)
      return res.status(404).json({ message: "Unable to get contents" });
    return res.status(200).json({ contents });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal Error" });
  }
});

// Get specific content based on contentId
router.get("/getcontent/:contentId", authMiddleware, async (req, res) => {
  const contentId = req.params.contentId;
  const userId = req.userId;
  try {
    const content = await prisma.content.findFirst({
      where: {
        userId,
        id: contentId as string,
      },
    });
    if (!content)
      return res.status(404).json({ message: "Unable to get content" });
    return res.status(200).json({ content });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal Error" });
  }
});

//update content
router.put("/updatecontent/:contentId", authMiddleware, async (req, res) => {
  const { title, type, link, description } = req.body;
  const contentId = req.params.contentId;

  try {
    const updateContent = await prisma.content.update({
      where: {
        id: contentId as string,
      },
      data: {
        title,
        type,
        link,
        description,
      },
    });

    if (!updateContent)
      return res.status(404).json({ message: "Unable to update content" });
    return res.status(200).json({ message: "Content Updated" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal Error" });
  }
});

//delete content
router.delete("/deletecontent/:contentId", authMiddleware, async (req, res) => {
  const contentId = req.params.contentId;

  try {
    const deleteContent = await prisma.content.delete({
      where: {
        id: contentId as string,
      },
    });

    if (!deleteContent)
      return res.status(404).json({ message: "Unable to delete content" });
    return res.status(200).json({ message: "Content deleted" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Intenal Error" });
  }
});

export default router;
