import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';
import { Repository } from 'typeorm';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
 constructor(private readonly productsService : ProductsService, @InjectRepository(User) private readonly userRepository : Repository<User>){}

async runSeed() {
   await  this.deleteTables();
   const  user = await   this.insertUsers();
  const resp =  await this.inserNewProducts(user);
   return 'Seed Executed';
     
  }

   private async deleteTables(){
    await this.productsService.deleteAllProducts();
  const queryBuilder = this.userRepository.createQueryBuilder();
  await queryBuilder.delete().where({}).execute();
   }

   private async insertUsers(){
    const seedUsers = initialData.users;
    const users : User [] = [];

    seedUsers.forEach(user =>{
      users.push(this.userRepository.create(user));
    })

    const dbUsers =  await this.userRepository.save(seedUsers);


   return dbUsers[0];
   }



  private async inserNewProducts(user : User){
      await  this.productsService.deleteAllProducts();

      const products = initialData.products;

      const insertPromiser = [];

      products.forEach(product => {
        insertPromiser.push(this.productsService.create(product,user));
      });

      await Promise.all(insertPromiser);
  }

}
