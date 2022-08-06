import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/commom/dtos/pagination.dto';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {validate as isUUID } from 'uuid';
import { ProductImage,Product } from './entities';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly  logger = new Logger('ProductsService');
  
 constructor(
  @InjectRepository(Product) 
   private readonly productRepository: Repository<Product>,

   @InjectRepository(ProductImage) 
   private readonly productImageRepository: Repository<ProductImage>,

    private readonly datatSource: DataSource
  ){}


  async create(createProductDto: CreateProductDto,user : User) {
   
     try {
    
      const {images = [], ...productDetails} = createProductDto;
      
       if(!createProductDto.slug){
        createProductDto.slug = createProductDto.title.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
       }


       const product = this.productRepository.create({...productDetails,
        images : images.map(image => this.productImageRepository.create({url : image})),
        user 
      });

        await this.productRepository.save(product);

        return {...product,images};
     } catch (error) {
      this.handleDBExeptions(error);
     }
  }

  async findAll(paginationDto : PaginationDto) {

    const {limit,offset} = paginationDto;
    try {
      
    const products = await this.productRepository.find({
      take:limit,skip:offset, relations : {images : true}//TODO : relations
});
    
     return  products.map(product => ({
      ...product, images : product.images.map(img => img.url)
     }));
    
  } catch (error) {
    this.handleDBExeptions(error);
  }
  }

  async findOne(term:string) {
    let product : Product;
     
   try {
    
     if(isUUID(term)){
       product = await this.productRepository.findOneBy({id : term});
     }else{
       const queryBuilder = this.productRepository.createQueryBuilder();
       product  = await queryBuilder.where('UPPER(title) =:title or slug =:slug',{
        title: term.toUpperCase(),
        slug: term.toUpperCase()
       }).leftJoinAndSelect('prod.images','prodImages').getOne();

     }
   if(!product) throw new NotFoundException(`Product not with ${term} found`);
    return product


   } catch (error) {
    this.handleDBExeptions(error);
   }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user : User) {

    const {images, ...toUpdate} = updateProductDto;


     const product = await this.productRepository.preload({
      id,...toUpdate})

    if(!product) throw new NotFoundException(`Product not with ${id} found`);

   //Create Query runner 
    const queryRunner = this.datatSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

   try {

     
     if(images) {
      await queryRunner.manager.delete(ProductImage, { product : {id}});
      product.images = images.map(image => this.productImageRepository.create({url: image}));
     }
         product.user = user;
         await queryRunner.manager.save(product);  
         await queryRunner.commitTransaction();
         await queryRunner.release();  
      // await  this.productRepository.save(product);
        return this.findOnePlain(id);
      } catch (error) {
         await queryRunner.rollbackTransaction();
         await queryRunner.release();
        this.handleDBExeptions(error);
      }
  }

  async remove(id: string) {
      try {
        const product = await this.productRepository.findOneBy({id})
        await this.productRepository.delete(id);

     if(!product) throw new NotFoundException(`Product with id: ${id} not found`)
    
      } catch (error) {
        this.handleDBExeptions(error);
      }

       
  }

  private handleDBExeptions(error : any){
    if(error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException(`"${error}"`);
  }


  async findOnePlain (term: string){
    const {images = [],...rest} = await this.findOne(term);
    return {...rest, images : images.map(img => img.url)}
 }

 async  deleteAllProducts(){
 const query = this.productRepository.createQueryBuilder('product');

 try {
     await query.delete().where({}).execute();
 } catch (error) {
     this.handleDBExeptions(error);
 }

 }

}
