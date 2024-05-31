import { BeforeUpdate, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Column } from "typeorm";
import { UserEntity } from "@app/user/user.entity";

@Entity({name : 'articles'})
export class ArticleEntity{
    @PrimaryGeneratedColumn()
    id : number

    @Column()
    slug : string

    @Column()
    title : string

    @Column({default : ''})
    description : string

    @Column({default : ''})
    body: string

    @Column('simple-array')
    tagList : string[]

    @Column({type : "timestamp", default : () => 'CURRENT_TIMESTAMP'})
    createdAt : Date

    @Column({type : "timestamp", default : () => 'CURRENT_TIMESTAMP'})
    updatedAt :  Date

    @Column({default : 0})
    favoritesCount : number

    @BeforeUpdate()
    updateTimestap(){
        this.updatedAt = new Date()
    }

    @ManyToOne(() => UserEntity, (user) => user.articles, {eager : true})
    author : UserEntity 
}