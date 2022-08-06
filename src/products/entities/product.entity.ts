import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/auth/entities/user.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from ".";


@Entity({name : 'products'})
export class Product {

  @ApiProperty({example : 'c2aca142-26a7-46b3-bef6-ba87ab5e714c', description : 'Product Id', uniqueItems : true})
 @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @ApiProperty({example : 'T-Shit Teslo', description : 'Product title', uniqueItems : true})
  @Column('text',{
    unique: true
  })
  title: string;

  @ApiProperty({example : 0, description : 'Product price'})
  @Column('float',{
    default:0
  })
  price: number;

  
  @ApiProperty({example : 'Deserunt enim nulla ipsum eiusmod eiusmod consequat deserunt non ex aliqua ullamco elit.', description : 'Product description', default:null})@Column({
    type: 'text',
    nullable: true
  })
  description: string;

  @ApiProperty({example : 't_shirt_teslo', description : 'Product Slug', uniqueItems : true})
  @Column('text',{
    unique : true
  })
  slug:string;
 
  @ApiProperty({example : 10, description : 'Product Stock', default : 0})
  @Column('int',{
    default: 0
  })
  stock: number;

  @ApiProperty({example : ['M','XL','S'], description : 'Product Sizes'})
  @Column('text',{
    array : true
  })
  sizes : string[];

  @ApiProperty({example : 'Men', description : 'Product Gender'})
  @Column('text')
  gender : string;
 
  @ApiProperty({example : '', description : 'Product Tags'})
  @Column('text',{
    array : true,
    default : []
  })
  tags : string[]


  //images
  @OneToMany(
    () => ProductImage,
    (productImage) => productImage.product,
    {cascade : true, eager : true}
  )
  images?: ProductImage[];



  @ManyToOne(
    ()=> User,
    (user) => user.product,
    {eager : true}
)
user : User



  @BeforeInsert()
   checkSlugInsert(){
      if(!this.slug){
         this.slug = this.title
      }
      this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
   }


   @BeforeUpdate()
   checkSlugUpdated(){
    this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'');
 }

}
