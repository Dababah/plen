import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const result: any = await prisma.$queryRaw`SHOW TABLES;`;
    console.log('Tables in DB:', result);
    
    const settingsTable = result.find((row: any) => Object.values(row).includes('user_settings'));
    if (settingsTable) {
      console.log('✅ user_settings table EXISTS');
    } else {
      console.log('❌ user_settings table MISSING');
    }
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
 

