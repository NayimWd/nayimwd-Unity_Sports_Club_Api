import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";

export const registerUser = asyncHandler(async(req: Request, res: Response)=>{
    const {name, email, password, phoneNumber, role} = req.body;

    
})