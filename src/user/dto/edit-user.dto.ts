import { IsEmail, IsNotEmpty } from "class-validator";

export class EditUserDto{
    @IsEmail()
    readonly email : string
    readonly bio : string
    readonly image : string
    readonly username : string
}