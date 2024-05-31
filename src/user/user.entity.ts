import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { hash } from 'bcrypt'
import { ArticleEntity } from "@app/article/article.entity";
import { CommentEntity } from "@app/comment/comment.entity";


@Entity({name : 'users'})
export class UserEntity{

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    email : string

    @Column()
    username : string

    @Column({default : ''})
    bio : string

    @Column({default : ''})
    image : string

    @Column({select : false})
    password : string

    @OneToMany(() => ArticleEntity, (articles) => articles.author)
    articles : ArticleEntity[]

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    likedArticles : ArticleEntity[]

    @OneToMany(() => CommentEntity, (comment) => comment.author )
    comments: CommentEntity[]


    @BeforeInsert()
    async hashPassword() {
        this.password = await hash(this.password, 10)
    }

}