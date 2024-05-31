import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('follows')
export class FollowEntity{

    @PrimaryGeneratedColumn()
    id :    number

    // За ким слідкують
    @Column()
    followerId : number

    // Той хто слідкує
    @Column()
    followsId : number
}