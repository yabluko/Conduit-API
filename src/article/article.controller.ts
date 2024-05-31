import { Controller, Post, ValidationPipe, Body, UsePipes, UseGuards , Put, Get, Param, Delete, Query } from "@nestjs/common";
import { ArticleService } from "./article.service";
import { ArticleCreateDto } from "./dto/article-create.dto";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { User } from "@app/user/decorators/user.decorator";
import { UserEntity } from "@app/user/user.entity";
import { ArticleResponseInterface } from "./types/articleResponse.interface";
import { ArticleEditDto } from "./dto/article-edit.dto";
import { ArticlesResponseInterface } from "./types/articlesResponse.interface";
import { NestFactory } from "@nestjs/core";
import { BackendValidationPipe } from "@app/shared/pipes/backendValidation.pipe";

@Controller('articles')
export class ArticleController{
    constructor(private readonly articleService : ArticleService ){}


    @Get()
    async getAllArticles(@User('id') currentUserId : number, @Query() query : any ) : Promise<ArticlesResponseInterface>{
        return await this.articleService.getAllArticles(currentUserId, query)
        
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async feedArticles(@Query() query : any, @User('id') currentUserId : number) : Promise<ArticlesResponseInterface>{
        return await this.articleService.feedArticles(query, currentUserId)
        
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async createArticle(@User() currentUser : UserEntity, @Body('article') articleCreateDto : ArticleCreateDto) : Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser , articleCreateDto)
        return this.articleService.buildArticleResponse(article)
    }

    @Get(':slug')
    async getArticle(@Param('slug') articleSlug : string) : Promise<ArticleResponseInterface> {
        const article = await this.articleService.getArticle(articleSlug)
        return this.articleService.buildArticleResponse(article)
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(@User() currentUser : UserEntity, @Param('slug') articleSlug : string) {
        return await this.articleService.deleteArticle(currentUser, articleSlug)
    }


    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async updateArticle(@Param('slug') slug : string,  @Body('article') articleEditDto : ArticleEditDto, @User('id') currentUserId : number ) : Promise<ArticleResponseInterface>{
        const article = await this.articleService.updateArticle(slug, articleEditDto, currentUserId)
        return this.articleService.buildArticleResponse(article)
    }


    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async favoriteArticle(@User('id') currentUserId : number, @Param('slug') slug : string) : Promise<ArticleResponseInterface> {
        const article = await this.articleService.favoriteArticle(currentUserId, slug)
        return this.articleService.buildArticleResponse(article)
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async unfavoriteArticle(@User('id') currentUserId : number, @Param('slug') slug : string) : Promise<ArticleResponseInterface>{
        const article = await this.articleService.unfavoriteArticle(currentUserId, slug)
        return this.articleService.buildArticleResponse(article)
    }

    
}