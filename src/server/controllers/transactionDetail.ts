import { Request, Response } from "express";
import { HttpClient } from "../../../utils/http";

const transactionDetail = async (req: Request, res: Response) => {
  const { trxId } = req.params;
  const client = new HttpClient({
    baseURL: process.env.API_URL as string,
    apiKey: process.env.API_KEY as string,
  });
  const transaction = await client.get(`/transactions/${trxId}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  res.json(transaction);
};

export default transactionDetail;