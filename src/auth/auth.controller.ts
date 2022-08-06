import { Controller, Get, Post, Body, UseGuards, SetMetadata} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Auth, GetUser, RawHeaders } from './decorators';
import { RoleProtected } from './decorators/role-protected.decorator';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

 @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto){
     return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute
  (
    // @Req() request : Express.Request
    @GetUser() user : User,
    @GetUser('email') userEmail : String,
    @RawHeaders() headers : string[]
  ){
    console.log(headers);
    return {ok : true , message :'Hello World',user,userEmail};
  }

  @Get('private2')
  // @SetMetadata('roles',['admin','super-user'])
  @RoleProtected(ValidRoles.superUser)
  @UseGuards(AuthGuard(),UserRoleGuard)
  privateRoute2(@GetUser() user : User){
    return {ok : true,user}
  }
 

@Get('private3')
@Auth()
privateRoute3(@GetUser() user : User){
    return {ok : true,user}
  }

@Get('renew')
@Auth()
checkAuthStatus(@GetUser() user : User){
    return this.authService.checkAuthStatus(user);
}


 
}
