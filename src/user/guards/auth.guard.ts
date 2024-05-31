import { ExpressRequestInterface } from "@app/types/expressRequest.interface";
import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";



@Injectable()
export class AuthGuard implements CanActivate{
    canActivate(ctx: ExecutionContext): boolean{
        const request = ctx.switchToHttp().getRequest<ExpressRequestInterface>()
        if(!request.user){
            throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED)
        }
        return true
    }
}