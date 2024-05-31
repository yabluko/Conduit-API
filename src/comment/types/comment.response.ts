import { CommentEntity } from "../comment.entity"
import { UserEntity } from "@app/user/user.entity"

export interface CommentResponseInterface{
    comment : CommentEntity & { 
        author : UserEntity
    }
}