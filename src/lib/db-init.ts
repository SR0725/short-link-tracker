import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
let isInitialized = false;

const prisma = new PrismaClient();

export async function initializeDatabase() {
  if (isInitialized) {
    return;
  }

  try {
    // 檢查資料庫連線
    await prisma.$connect();
    
    // 檢查是否已有表格 (檢查 links 表)
    const tablesExist = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'links'
      );
    `;
    
    // @ts-expect-error - tablesExist is a raw query result
    if (!tablesExist[0]?.exists) {
      console.log('🔄 Running database migrations...');
      
      // 執行 Prisma 遷移
      await execAsync('npx prisma migrate deploy');
      console.log('✅ Database migrations completed');
    } else {
      console.log('✅ Database already initialized');
    }
    
    isInitialized = true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    // 不拋出錯誤，讓應用程式繼續運行
    // 用戶可以手動初始化或重啟服務
  } finally {
    await prisma.$disconnect();
  }
}