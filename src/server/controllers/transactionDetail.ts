import { Request, Response } from "express";
import { HttpClient } from "../../../utils/http";

const transactionDetail = async (req: Request, res: Response) => {
  const { trxId } = req.params;
  
  console.log('TransactionDetail called with trxId:', trxId);
  console.log('API_URL:', process.env.API_URL);
  console.log('API_KEY:', process.env.API_KEY ? 'SET' : 'NOT SET');
  
  try {
    const client = new HttpClient({
      baseURL: process.env.API_URL as string,
      apiKey: process.env.API_KEY as string,
    });
    
    console.log('Making API call to:', `${process.env.API_URL}/transactions/${trxId}`);
    
    const transaction = await client.get(`/transactions/${trxId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    console.log('Transaction data received:', transaction);
    res.json(transaction);
  } catch (error: any) {
    console.error('Error in transactionDetail:', error);
    res.status(500).json({ error: 'Failed to fetch transaction details', details: error.message });
  }
};

export default transactionDetail;