import { Injectable, NestMiddleware } from "@nestjs/common";
import {  Response, NextFunction} from "express";
import { ExpressRequestInterface } from "@app/types/expressRequest.interface";
import { verify, JwtPayload } from "jsonwebtoken";
import { UserService } from "../user.service";
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthMiddleware implements NestMiddleware{
    constructor(private readonly userService : UserService ){}
    async use(req: ExpressRequestInterface, res: Response, next : NextFunction ) {
        if(!req.headers.authorization){
            req.user = null
            next()
            return 
        }
        const token = req.headers.authorization.split(' ')[1]
        
        try{

            const decoded = await verify(token, process.env.JWT_SECRETKEY) as JwtPayload
            const user = await this.userService.findById(decoded.id)
            req.user = user
            next()
        }catch(err){
            req.user = null
            next()
        }
     
    }

}