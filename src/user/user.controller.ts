import { Controller, Post,Get, Body, UsePipes, ValidationPipe, UseGuards, Put } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserResponseInterface } from "./types/userResponse.interface";
import { LoginUserDto } from "./dto/login-user.dto";
import { User } from "./decorators/user.decorator";
import { UserEntity } from "./user.entity";
import { AuthGuard } from "./guards/auth.guard";
import { EditUserDto } from "./dto/edit-user.dto";
import { BackendValidationPipe } from "@app/shared/pipes/backendValidation.pipe";


@Controller()
export class UserController {
    constructor(private readonly userService : UserService){}

    @Post('users')
    @UsePipes(new BackendValidationPipe())
    async createUser(@Body('user') createdUserDto : CreateUserDto ) : Promise<UserResponseInterface> {
        const user = await this.userService.createUser(createdUserDto)
        return this.userService.buildResponseUser(user)
    }

    @Post('users/login')
    @UsePipes(new BackendValidationPipe())
    async loginUser(@Body('user') userDateDto : LoginUserDto ) : Promise<UserResponseInterface> {
        const user = await this.userService.loginUser(userDateDto)
        return this.userService.buildResponseUser(user )
    }

    @Get('user')
    @UseGuards(AuthGuard)
    async getUser(@User() user : UserEntity) : Promise<UserResponseInterface> {
        return this.userService.buildResponseUser(user)
    }

    @Put('user')
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async updateUser(@User('id') currentUserId : number, @Body('user') userEditDate : EditUserDto) : Promise<UserResponseInterface>{
        const updatedUser = await this.userService.updateUser(currentUserId, userEditDate)
        return updatedUser
    }

}