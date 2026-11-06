import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

class RegisterDTO {
    @IsString()
    @IsNotEmpty()
    @Length(3, 75)
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    @Length(6, 100)
    password!: string;
}

class LoginDTO {
    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsString()
    @IsNotEmpty()
    password!: string;
}

export { RegisterDTO, LoginDTO };
