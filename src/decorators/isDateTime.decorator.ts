import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from 'class-validator';
import Regex from '../constants/regex.constant';

const IsDateTime = (validationOptions?: ValidationOptions) => {
    return (object: object, propertyName: string): void => {
        registerDecorator({
            name: 'IsDateTime',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate: (value: any, args: ValidationArguments): boolean => {
                    return (
                        typeof value === 'string' && Regex.DateTime.test(value)
                    );
                },
                defaultMessage: (args: ValidationArguments): string => {
                    return `${args.property} must be a valid DateTime format (YYYY-MM-DDTHH:mm:ss)`;
                },
            },
        });
    };
};

export default IsDateTime;
