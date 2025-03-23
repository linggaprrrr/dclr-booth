import path from "path";
import fs from "fs";
import { Request, Response } from "express";
const deletePicture = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), "uploads", filename);
    fs.unlink(filePath, (err) => {
      if (err) throw err;
    });
    res.status(200).json({
      success: true,
      message: "Picture deleted successfully",
    });
} catch (error) {
    console.error("Error deleting picture:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting picture",
    });
  }
}

export default deletePicture;
