import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { sign } from 'jsonwebtoken'
import { UserResponseInterface } from "./types/userResponse.interface";
import {compare} from 'bcrypt'
import * as dotenv from 'dotenv';
dotenv.config();




@Injectable()
export class UserService {
    constructor(@InjectRepository(UserEntity) private readonly userRepository : Repository<UserEntity>  ){}

    async createUser(createdUserDto : CreateUserDto) : Promise<UserEntity>{

        const errorResponse = {
            errors : {}
        }

        const userByEmail = await this.userRepository.findOne({
            where : { email : createdUserDto.email }
        })
        const userByUsername = await this.userRepository.findOne({
            where : { username : createdUserDto.username }
        })

        if(userByEmail){
            errorResponse.errors['email'] = ['has already been taken']
        }
        if(userByUsername){
            errorResponse.errors['username'] = ['has already been taken']
        }

        if(userByEmail || userByUsername){
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY)
        }

        const newUser = new UserEntity()
        Object.assign(newUser, createdUserDto)
       return  await this.userRepository.save(newUser)

    }

    async loginUser(userDateDto) : Promise<UserEntity> {
        const errorResponse = {
            errors : {
                'email or password' : 'not valid'
            }
        }
        const user = await this.userRepository.findOne({
            where : { email : userDateDto.email },
            select : ['id', 'username','email', 'bio', 'image', 'password']
        }) 
        
        if(!user){
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY )
        }

        const match = await compare(userDateDto.password, user.password)

        if(!match){
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY )
        }

        delete user.password;
        return user
    }

    async updateUser(currentUserId: number, userEditDate) : Promise<any> {
        const user = await this.findById(currentUserId)
        Object.assign(user, userEditDate)
        return await this.userRepository.save(user)

    }

    findById(userId : number) : Promise<UserEntity>{
        return this.userRepository.findOne({
            where : {id : userId}
        })
    }

    generatedToken(user : UserEntity) : string{
        return sign({
            id : user.id,
            name : user.username,
            email : user.email
        }, 
        process.env.JWT_SECRETKEY
        )
    }
    
    buildResponseUser(user : UserEntity) : UserResponseInterface {
        return {
            user : {
                ...user,
                token : this.generatedToken(user)
            }
        }
    }
}