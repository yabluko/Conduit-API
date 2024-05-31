import { Controller, UseGuards } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { Post, Get, Delete, Body, Param } from "@nestjs/common";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { CommentDto } from "./dto/comment.dto";
import { CommentEntity } from "./comment.entity";
import { User } from "@app/user/decorators/user.decorator";
import { UserEntity } from "@app/user/user.entity";


@Controller('articles')
export class CommentController{
    constructor(private readonly сommentService : CommentService){}

    @Post(':slug/comments')
    @UseGuards(AuthGuard)
    async addComment(@User() currentUser : UserEntity, @Body('comment') commentBody : CommentDto, @Param('slug') articleSlug : string) : Promise<any>{
        const comment = await this.сommentService.addComment(commentBody, articleSlug)
        return await this.сommentService.buildResponse(comment,currentUser) 
    }



}