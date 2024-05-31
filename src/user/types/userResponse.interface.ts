import { userType } from "./user.type";

export interface UserResponseInterface {
    user : userType & { token : string }
}