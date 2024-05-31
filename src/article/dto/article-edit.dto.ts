import { IsNotEmpty } from "class-validator";

export class ArticleEditDto {
    
    readonly title : string;
    readonly description : string;
    readonly body : string;

}