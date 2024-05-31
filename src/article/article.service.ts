import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, DeleteResult, Repository,getRepository } from "typeorm";
import { ArticleEntity } from "./article.entity";
import { UserEntity } from "@app/user/user.entity";
import { ArticleCreateDto } from "./dto/article-create.dto";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import slugify from "slugify";
import { ArticleEditDto } from "./dto/article-edit.dto";
import { FollowEntity } from "@app/profile/follow.entity";


@Injectable()
export class ArticleService{
    
    constructor(@InjectRepository(ArticleEntity) private readonly articleRepository : Repository<ArticleEntity>,
    @InjectRepository(UserEntity) private readonly userRepository : Repository<UserEntity>,
    @InjectRepository(FollowEntity) private readonly followRepository : Repository<FollowEntity>,
    private readonly dataSource : DataSource
    ){}

    async createArticle(currentUser : UserEntity , articleCreateDto : ArticleCreateDto ) : Promise<ArticleEntity>{ 
        
        const article = new ArticleEntity()
        Object.assign(article, articleCreateDto)
        console.log(articleCreateDto.tagList)
        if(!articleCreateDto.tagList){
            article.tagList = []
        }

        article.author = currentUser
        article.slug = this.createSlug(articleCreateDto.title)

       return await this.articleRepository.save(article)
    }


    async getArticle(slug : string) : Promise<ArticleEntity> {
        const article =  await this.findBySlug(slug)
        if(!article){
            throw new HttpException('No such article', HttpStatus.BAD_REQUEST)
        }
        
        return article
    }

    async deleteArticle(currentUser : UserEntity, slug : string) : Promise<DeleteResult>{
        const article =  await this.findBySlug(slug)

        if(!article){
            throw new HttpException(`No such article`, HttpStatus.NOT_FOUND)
        }

        if(article.author.id !== currentUser.id){
            throw new HttpException(`You are not author`, HttpStatus.FORBIDDEN)
        }

        return await this.articleRepository.delete({slug})
    }

    async updateArticle(slug : string, articleEditDto : ArticleEditDto, currentUserId : number) : Promise<ArticleEntity>{
        const article = await this.findBySlug(slug);

        if(!article){
            throw new HttpException('No such article', HttpStatus.NOT_FOUND)
        }

        if(article.author.id !== currentUserId){
            throw new HttpException('You are not author', HttpStatus.FORBIDDEN)
        }

        Object.assign(article, articleEditDto)
        article.slug = this.createSlug(article.title)

        return await this.articleRepository.save(article)
    }

    async getAllArticles(currentUserId : number, query : any) : Promise<ArticlesResponseInterface> {
        const queryBuilder = this.dataSource.getRepository(ArticleEntity).
        createQueryBuilder('articles').leftJoinAndSelect('articles.author', 'author')


        if(query.tag){
            queryBuilder.andWhere(`articles.tagList like :tag`, {
                tag : `%${query.tag}%`
            })
        }
        
        if(query.author){
            const author = await this.userRepository.findOne({
                where : {
                    username : query.author
                }
            })
            
            queryBuilder.andWhere('articles.author.id = :id', {id : author.id})
        }
        if(query.offset){
            queryBuilder.offset(query.offset)
        }

        if(query.limit){
            queryBuilder.limit(query.limit)
        }
        
        if(query.favorited){
            const user = await this.userRepository.findOne({
                where : {
                    username : query.favorited
                },
                relations : ['likedArticles']
            });

            const likedIds = user.likedArticles.map(article => article.id)
            if(likedIds){
                queryBuilder.andWhere('articles.id IN (:...ids)',{ids : likedIds})
            }else{
                queryBuilder.andWhere('1=0')
            }

        }
        
        let likedArticlesIds : number[] = []
        if(currentUserId){
            const user = await this.userRepository.findOne({
                where : {
                    id : currentUserId
                },
                relations : ['likedArticles']
            })
            likedArticlesIds = user.likedArticles.map((article) => article.id)
        }

        queryBuilder.orderBy('articles.createdAt', 'DESC')
        const articlesCount = await queryBuilder.getCount()
        
        const articles = await queryBuilder.getMany()
        const favoriteArticles = articles.map((article) => {
            const favorited = likedArticlesIds.includes(article.id);
            return {...article, favorited}
        });
            

        return {articles: favoriteArticles , articlesCount}
    }

    async findBySlug(slug) : Promise<ArticleEntity> {
        return this.articleRepository.findOne({where : {slug }})
    }

    
    async favoriteArticle(currentUserId : number, slug : string) : Promise<ArticleEntity> {

        const user = await this.userRepository.findOne({ 
            where  : { id : currentUserId },
            relations : ['likedArticles'],
        })

        const article = await this.findBySlug(slug)
        
        if(!article){
            throw new HttpException("No such article", HttpStatus.BAD_REQUEST)
        }

        const isNotLikedArticle = user.likedArticles.findIndex((likedArticle) => likedArticle.id === article.id) === -1 
       
        if(isNotLikedArticle){
            article.favoritesCount++
            user.likedArticles.push(article)

            await this.articleRepository.save(article)
            await this.userRepository.save(user)
        }


        return article
      
    }

    async unfavoriteArticle(currentUserId : number, slug : string) : Promise<ArticleEntity>{
        const user = await this.userRepository.findOne({ 
            where : {
            id : currentUserId
        },
        relations : ['likedArticles']
        
        })

        const article = await this.findBySlug(slug)

        const likedArticle = user.likedArticles.findIndex((likedArticle) => likedArticle.id === article.id)


        if(likedArticle >= 0){
            article.favoritesCount--
            user.likedArticles.splice(likedArticle, 1)
            await this.articleRepository.save(article)
            await this.userRepository.save(user)
        }

        return  article 
    }

    async feedArticles(query : any, currentUserId : number) : Promise<ArticlesResponseInterface>{
        const follows = await this.followRepository.find({
            where : {
                followsId : currentUserId
            }
        })
        
        if(follows.length === 0){
            return { articles : [], articlesCount : 0 }
        }
        const followedIds = follows.map(item => item.followerId)
    
        const queryBuilder = this.dataSource.getRepository(ArticleEntity)
          .createQueryBuilder('articles')
          .leftJoinAndSelect('articles.author', 'author')
          .where('articles.authorId IN (:...ids)', { ids: followedIds });
    
        queryBuilder.orderBy('articles.createdAt', 'DESC');
    
        const articlesCount = await queryBuilder.getCount();
    
        if (query.limit) {
          queryBuilder.limit(query.limit);
        }
    
        if (query.offset) {
          queryBuilder.offset(query.offset);
        }
    
        const articles = await queryBuilder.getMany();
    
        return { articles, articlesCount };

    }


    buildArticleResponse(article : ArticleEntity) : ArticleResponseInterface {
        return { article }
    }

    private createSlug(title : string) : string{
        return slugify(title,{lower: true }) + '-' + ((Math.random() * Math.pow(36,6)) | 0).toString(36)
    }
}