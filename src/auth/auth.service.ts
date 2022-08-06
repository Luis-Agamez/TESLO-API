import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { compareSync, hashSync } from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userDate } = createUserDto;

      const user = this.userRepository.create({
        ...userDate,
        password: hashSync(password, 10),
      });
     

      await this.userRepository.save(user);
      delete user.password;

      return {...user,token : this.getJwtToken({id: user.id})};
      //TODO: return JWT
    } catch (error) {
      console.log(error);
      this.handleDbErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {

    const { password,email} = loginUserDto;

    const user = await this.userRepository.findOne({ where : {email}, select : {email : true, password : true,id : true}})

    if(!user) throw new UnauthorizedException('Credentials are not valid (email)');

    if(!compareSync(password, user.password)) throw new UnauthorizedException('Credentials are not valid (password)');
   

     //TODO: return JWT

    return {...user,token : this.getJwtToken({id: user.id})};
  }

  private handleDbErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);
    throw new InternalServerErrorException('Please Chech Server Logs');
  }


  private getJwtToken(payload : JwtPayload){
     const token = this.jwtService.sign(payload);
     return token;
  }

 async checkAuthStatus(user : User){
  return {...user,token : this.getJwtToken({id: user.id})};
 }
}
