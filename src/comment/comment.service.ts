import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CommentEntity } from "./comment.entity";
import { CommentDto } from "./dto/comment.dto";
import { ArticleEntity } from "@app/article/article.entity";
import { FollowEntity } from "@app/profile/follow.entity";
import { UserEntity } from "@app/user/user.entity";

@Injectable()
export class CommentService{
    constructor(@InjectRepository(CommentEntity) private commentRepository : Repository<CommentEntity>,
   @InjectRepository(ArticleEntity) private articleRepository : Repository<ArticleEntity>,
   @InjectRepository(FollowEntity) private followRepository : Repository<FollowEntity>
){}

    async addComment(commentBody : CommentDto , articleSlug : string){
        const article = await this.articleRepository.findOne({
            where : {
                slug : articleSlug
            }
        })

        console.log('Article Entity', article)


        const newComment = new CommentEntity()
        newComment.body = commentBody.body
        newComment.author = article.author


        
        await this.commentRepository.save(newComment)
        console.log('New Comment', newComment)
        return newComment

    }

    async buildResponse(newComment : CommentEntity, currentUser : UserEntity){ 
        let follow = false
        const following = await this.followRepository.findOne({
            where : {
                followerId : currentUser.id,
                followsId : newComment.author.id
            }
        })

        if(following){
            follow = true
        }

        return {
            comment : newComment ,
            follow
        }
    }

}