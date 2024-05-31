import { Controller, Get, Param, UseGuards , Post, Delete, Query} from "@nestjs/common";
import { ProfileService } from "./profile.service";
import { ProfileResponseInterface } from "./types/profileResponse.inteface";
import { User } from "@app/user/decorators/user.decorator";
import { AuthGuard } from "@app/user/guards/auth.guard";
import { ArticlesResponseInterface } from "@app/article/types/articlesResponse.interface";
import { query } from "express";


@Controller('profiles')
export class ProfileController{
    constructor(private readonly profileService : ProfileService ){}

    @Get(':username')
    async getProfile(@Param('username') username : string, @User('id') currentUserId : number) : Promise<ProfileResponseInterface>{
        const profile = await this.profileService.getProfile(username, currentUserId)
        return this.profileService.buildResponse(profile)
    }


    @Post(':username/follow')
    @UseGuards(AuthGuard)
    async followUser(@Param('username') username : string, @User('id') currentUserId : number) : Promise<ProfileResponseInterface>{
        const profile = await this.profileService.followUser(username, currentUserId)
        return this.profileService.buildResponse(profile)
    }

    @Delete(':username/follow')
    @UseGuards(AuthGuard)
    async unfollowUser(@Param('username') username : string,  @User('id') currentUserId : number) : Promise<ProfileResponseInterface>{
        const profile = await this.profileService.unfollowUser(username, currentUserId)
        return this.profileService.buildResponse(profile)
    }

}