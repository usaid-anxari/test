import { DataSource } from 'typeorm';
import { Business } from '../business/entities/business.entity';
import { User } from '../users/entities/user.entity';
import { BusinessUser } from '../business/entities/business-user.entity';

export async function seed(dataSource: DataSource) {
  const businessRepo = dataSource.getRepository(Business);
  const userRepo = dataSource.getRepository(User);
  const buRepo = dataSource.getRepository(BusinessUser);

  const users = [
    { email: 'owner1@glambeauty.com', name: 'Owner GlamBeauty' },
    { email: 'owner2@citycuts.com', name: 'Owner CityCuts' },
  ];

  const businesses = [
    { slug: 'glambeauty', name: 'GlamBeauty', brandColor: '#FF69B4', contactEmail: 'contact@glambeauty.com' },
    { slug: 'citycuts', name: 'CityCuts', brandColor: '#1E90FF', contactEmail: 'contact@citycuts.com' },
  ];

  for (const u of users) {
    const user = userRepo.create(u);
    await userRepo.save(user);
  }

  for (const b of businesses) {
    const business = businessRepo.create(b);
    await businessRepo.save(business);
  }

  const allUsers = await userRepo.find();
  const allBusinesses = await businessRepo.find();

  await buRepo.save({
    userId: allUsers[0].id,
    businessId: allBusinesses[0].id,
    role: 'owner',
    isDefault: true,
  });

  await buRepo.save({
    userId: allUsers[1].id,
    businessId: allBusinesses[1].id,
    role: 'owner',
    isDefault: true,
  });
}
