import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentEntity } from "./comment.entity";
import { CommentController } from "./comment.controller";
import { CommentService } from "./comment.service";
import { ArticleEntity } from "@app/article/article.entity";
import { FollowEntity } from "@app/profile/follow.entity";



@Module({
    imports : [TypeOrmModule.forFeature([CommentEntity, ArticleEntity, FollowEntity])],
    providers : [CommentService],
    controllers : [CommentController]
})
export class CommentModule{}