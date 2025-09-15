import { AppDataSource } from './data-source';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';

async function check() {
  await AppDataSource.initialize();

  const users = await AppDataSource.getRepository(User).find();
  const businesses = await AppDataSource.getRepository(Business).find();
  const busUsers = await AppDataSource.getRepository(BusinessUser).find();

  console.log('Users:', users);
  console.log('Businesses:', businesses);
  console.log('BusinessUsers:', busUsers);

  process.exit(0);
}

check();
