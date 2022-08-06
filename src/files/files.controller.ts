import { BadRequestException, Controller,  Get,  Param,  Post, Res, UploadedFile, UseInterceptors, } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
     private readonly  configService: ConfigService
    ) {}

  @Get('product/:imageName')
   fineProductImage(
    @Res() res : Response,
    @Param('imageName') imageName: string
   ): void{
  const path = this.filesService.getStaticProductImage(imageName);

  res.sendFile(path);

   }


  @Post('product')
  @UseInterceptors(FileInterceptor('file',{
    fileFilter : fileFilter , 
    // limits : { fileSize : 100000},
    storage :  diskStorage({
      destination : './static/products',
      filename : fileNamer
    })

  }))
  uploadProductImage( @UploadedFile() file : Express.Multer.File) {  

        if(!file){
          throw new BadRequestException('Make sure that the file is an image')
        } 
     
        console.log(file);

        const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;

     return  { secureUrl  };
  }

 

}
