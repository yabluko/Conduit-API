import { ArgumentMetadata, HttpException, HttpStatus, PipeTransform, ValidationPipe } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { ValidationError, isNotEmpty, validate } from "class-validator";

export class BackendValidationPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const object = plainToClass(metadata.metatype, value);
        const errors = await validate(object)
        if(typeof object !== 
            'object'){
            return value
        }
        
        if(errors.length === 0){
            return value
        }
        
        throw new HttpException({errors : this.formatError(errors)}, HttpStatus.UNPROCESSABLE_ENTITY)

    }


    formatError(errors : any[]){
        return errors.reduce((acc, currValue) => {
            let name = currValue.property
            let error = currValue.constraints
            acc[name] = Object.values(error)

            return acc

        }, {})
    }

}