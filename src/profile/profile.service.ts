import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ProfileType } from "./types/profile.type";
import { ProfileResponseInterface } from "./types/profileResponse.inteface";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "@app/user/user.entity";
import { Repository } from "typeorm";
import { FollowEntity } from "./follow.entity";


@Injectable()
export class ProfileService{
    constructor(@InjectRepository(UserEntity) private readonly userRepository : Repository<UserEntity>,
        @InjectRepository(FollowEntity) private readonly followRepository : Repository<FollowEntity>
    ){}

    async getProfile(username : string, currentUserId : number) : Promise<ProfileType> {
        const user = await this.userRepository.findOne({ 
            where : { 
                username 
            }
        })
        if(!user){
            throw new HttpException(`Profile doesn't exist`, HttpStatus.NOT_FOUND)
        }


        const existFollow = await this.followRepository.findOne({
            where : {
                followsId : user.id
            }
        })

        if(existFollow && currentUserId){
            console.log('Hi')
            return {...user, following : Boolean(existFollow)}
        }


        return {...user, following : false}
    }

    async followUser(username : string, currentUserId : number) : Promise<ProfileType> {
        const followedUser = await this.userRepository.findOne({
            where : {
                username
            }
        })

        if(!followedUser){
            throw new HttpException(`Profile doesn't exist`, HttpStatus.NOT_FOUND)
        }

        if(followedUser.id === currentUserId){
            throw new HttpException(`You can't follow yourself`, HttpStatus.BAD_REQUEST)
        }

        const follows = await this.followRepository.findOne({
            where : {
                followerId : followedUser.id,
                followsId : currentUserId
            }
        })

        if(!follows){
            const followCreate = new FollowEntity()

            followCreate.followerId = followedUser.id
            followCreate.followsId = currentUserId

            await this.followRepository.save(followCreate)
        }
       
        return {...followedUser, following : true}
    }



    async unfollowUser(username : string, currentUserId : number) : Promise<ProfileType> {
        const unfollowUser = await this.userRepository.findOne({
            where : {
                username 
            }
        })
        console.log(username)
        console.log(unfollowUser)

        
        if(!unfollowUser){
            throw new HttpException(`Profile doesn't exist`, HttpStatus.NOT_FOUND)
        }

        if(unfollowUser.id === currentUserId){
            throw new HttpException(`You can't unfollow yourslef`, HttpStatus.FORBIDDEN)
        }


       await this.followRepository.delete({
        followerId : unfollowUser.id,
        followsId : currentUserId
       })

        return {...unfollowUser , following : false}

    }

    buildResponse(profile : ProfileType) : ProfileResponseInterface {
        delete profile.email
        return { profile }
    }


}