import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';
import * as dotenv from "dotenv"

dotenv.config()

const ds = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Business, BusinessUser],
  synchronize: true,
});

async function run() {
  console.log("Start Seeding......");
  
  await ds.initialize();
  const userRepo = ds.getRepository(User);
  const bizRepo = ds.getRepository(Business);
  const buRepo = ds.getRepository(BusinessUser);

  // demo users with Auth0 IDs placeholders (replace with real Auth0 IDs for testing)
  const users = [
    {
      auth0Id: 'auth0|owner1',
      email: 'owner1@glambeauty.com',
      name: 'Owner GlamBeauty',
    },
    {
      auth0Id: 'auth0|owner2',
      email: 'owner2@citycuts.com',
      name: 'Owner CityCuts',
    },
  ];
  const savedUsers:User [] = [];
  for (const u of users) {
    let ex = await userRepo.findOne({ where: { auth0Id: u.auth0Id } });
    if (!ex) {
      ex = userRepo.create(u);
      await userRepo.save(ex);
    }
    savedUsers.push(ex);
    console.log("Saved User.......");
  }
 
  const businesses = [
    {
      slug: 'glambeauty',
      name: 'GlamBeauty',
      brandColor: '#FF69B4',
      contactEmail: 'contact@glambeauty.com',
    },
    {
      slug: 'citycuts',
      name: 'CityCuts',
      brandColor: '#1E90FF',
      contactEmail: 'contact@citycuts.com',
    },
  ];
  const savedBiz:Business [] = [];
  for (const b of businesses) {
    let ex = await bizRepo.findOne({ where: { slug: b.slug } });
    if (!ex) {
      ex = bizRepo.create(b);
      await bizRepo.save(ex);
    }
    savedBiz.push(ex);
    console.log("Saving Business........");
    
  }

  // link owners
  await buRepo.save({
    userId: savedUsers[0].id,
    businessId: savedBiz[0].id,
    role: 'owner',
    isDefault: true,
  });
  await buRepo.save({
    userId: savedUsers[1].id,
    businessId: savedBiz[1].id,
    role: 'owner',
    isDefault: true,
  });

  console.log('Seed done!');
  process.exit(0);
}
run().catch((e) => {
  console.error(e);
  process.exit(1);
});
