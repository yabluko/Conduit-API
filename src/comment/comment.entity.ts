import { Entity, Column, ManyToOne } from "typeorm";
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "@app/user/user.entity";



@Entity({name : 'comment'})
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id : number

    @CreateDateColumn({type : 'timestamp'})
    createdAt : Date

    @UpdateDateColumn({type : 'timestamp'})
    updatedAt : Date


    @Column()
    body : string

    @ManyToOne(() => UserEntity, (user) => user.comments )
    author : UserEntity

}