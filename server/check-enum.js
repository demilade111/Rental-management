import { prisma } from './src/prisma/client.js';

async function checkEnum() {
  try {
    // Try to query the enum values directly from the database
    const result = await prisma.$queryRaw`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'NotificationType')
      ORDER BY enumlabel;
    `;
    
    console.log('📋 NotificationType enum values in database:');
    result.forEach(row => {
      console.log(`  - ${row.enumlabel}`);
    });
    
    const hasPaymentReceiptUploaded = result.some(r => r.enumlabel === 'PAYMENT_RECEIPT_UPLOADED');
    const hasPaymentReceiptApproved = result.some(r => r.enumlabel === 'PAYMENT_RECEIPT_APPROVED');
    const hasPaymentReceiptRejected = result.some(r => r.enumlabel === 'PAYMENT_RECEIPT_REJECTED');
    
    console.log('\n✅ Status:');
    console.log(`  PAYMENT_RECEIPT_UPLOADED: ${hasPaymentReceiptUploaded ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  PAYMENT_RECEIPT_APPROVED: ${hasPaymentReceiptApproved ? '✅ EXISTS' : '❌ MISSING'}`);
    console.log(`  PAYMENT_RECEIPT_REJECTED: ${hasPaymentReceiptRejected ? '✅ EXISTS' : '❌ MISSING'}`);
    
    if (!hasPaymentReceiptUploaded || !hasPaymentReceiptApproved || !hasPaymentReceiptRejected) {
      console.log('\n⚠️  Some enum values are missing. Please run:');
      console.log('   npx prisma migrate deploy');
      process.exit(1);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error checking enum:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkEnum();

