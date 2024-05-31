import { userType } from "@app/user/types/user.type"

export type ProfileType = userType & {
    following  : boolean
}