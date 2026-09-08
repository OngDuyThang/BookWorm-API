import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { getEnvFilePath, ROLE } from '@app/common';
import dataSource from './data-source';
import { UserEntity } from '../modules/user';

dotenv.config({
  path: getEnvFilePath('auth'),
});

// Hardcoded admin profile values
const ADMIN_EMAIL = 'admin@bookworm.com';
const ADMIN_FIRST_NAME = 'admin';
const ADMIN_LAST_NAME = 'admin';

export async function seedAdmin(): Promise<void> {
  // Only username and password are configurable via environment variables
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.warn('⚠️  ADMIN_USERNAME or ADMIN_PASSWORD not configured in environment. Skipping admin seed.');
    return;
  }

  console.log(`📡 Connecting to database [${process.env.DB_NAME}] on ${process.env.DB_HOST}:${process.env.DB_PORT}...`);
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  try {
    const userRepo = dataSource.getRepository(UserEntity);
    const existing = await userRepo.findOne({
      where: [
        { username },
        { email: ADMIN_EMAIL }
      ]
    });

    if (existing) {
      if (
        existing.email !== ADMIN_EMAIL ||
        existing.first_name !== ADMIN_FIRST_NAME ||
        existing.last_name !== ADMIN_LAST_NAME
      ) {
        await userRepo.update({ id: existing.id }, {
          email: ADMIN_EMAIL,
          first_name: ADMIN_FIRST_NAME,
          last_name: ADMIN_LAST_NAME,
        });
        console.log(`🔄 Admin user "${username}" profile synchronized: email=${ADMIN_EMAIL}, first_name=${ADMIN_FIRST_NAME}, last_name=${ADMIN_LAST_NAME}.`);
      } else {
        console.log(`ℹ️  Admin user "${username}" (email: "${ADMIN_EMAIL}") already exists in database. Skipping creation.`);
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = userRepo.create({
      username,
      password: hashedPassword,
      email: ADMIN_EMAIL,
      first_name: ADMIN_FIRST_NAME,
      last_name: ADMIN_LAST_NAME,
      role: ROLE.ADMIN,
      active: true,
      enable_two_factor: false,
    });

    await userRepo.save(admin);
    console.log(`✅ Successfully seeded initial admin user "${username}" with ROLE.ADMIN (email: ${ADMIN_EMAIL}, first_name: ${ADMIN_FIRST_NAME}, last_name: ${ADMIN_LAST_NAME}).`);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

seedAdmin()
  .then(() => {
    console.log('🎉 Admin seeding process finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Admin seeding failed with error:', err);
    process.exit(1);
  });
