// Script untuk fix URL di database
// Mengubah http://localhost:3000/uploads/... menjadi /uploads/...
// Mengubah http://localhost:4000/uploads/... menjadi /uploads/...

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUrls() {
  console.log('Memulai perbaikan URL di database...');

  // 1. Fix URL di tabel naskah menggunakan Prisma API
  console.log('1. Mencari naskah dengan URL localhost...');
  
  const naskahList = await prisma.naskah.findMany({
    where: {
      OR: [
        { urlSampul: { contains: 'localhost' } },
        { urlFile: { contains: 'localhost' } }
      ]
    }
  });
  
  console.log('   Ditemukan ' + naskahList.length + ' naskah dengan URL localhost');
  
  for (const naskah of naskahList) {
    const updates = {};
    
    if (naskah.urlSampul && naskah.urlSampul.includes('localhost')) {
      updates.urlSampul = naskah.urlSampul.replace(/http:\/\/localhost:\d+/, '');
    }
    
    if (naskah.urlFile && naskah.urlFile.includes('localhost')) {
      updates.urlFile = naskah.urlFile.replace(/http:\/\/localhost:\d+/, '');
    }
    
    if (Object.keys(updates).length > 0) {
      await prisma.naskah.update({
        where: { id: naskah.id },
        data: updates
      });
      console.log('   - Fixed: ' + naskah.judul);
    }
  }
  
  // 2. Fix URL di tabel file
  console.log('2. Mencari file dengan URL localhost...');
  
  const fileList = await prisma.file.findMany({
    where: {
      url: { contains: 'localhost' }
    }
  });
  
  console.log('   Ditemukan ' + fileList.length + ' file dengan URL localhost');
  
  for (const file of fileList) {
    if (file.url && file.url.includes('localhost')) {
      const newUrl = file.url.replace(/http:\/\/localhost:\d+/, '');
      await prisma.file.update({
        where: { id: file.id },
        data: { url: newUrl }
      });
      console.log('   - Fixed: ' + file.namaFileAsli);
    }
  }

  // 3. Verifikasi hasil
  console.log('3. Verifikasi hasil...');
  
  const sample = await prisma.naskah.findMany({
    select: { judul: true, urlSampul: true, urlFile: true },
    take: 5
  });
  
  console.log('   Sample data setelah fix:');
  sample.forEach(function(n) {
    console.log('   - ' + n.judul);
    console.log('     urlSampul: ' + (n.urlSampul || '(kosong)'));
    console.log('     urlFile: ' + (n.urlFile || '(kosong)'));
  });

  console.log('\nSelesai! Semua URL sudah diubah ke relative path.');
}

fixUrls()
  .catch(function(err) { console.error('Error:', err); })
  .finally(function() { prisma.$disconnect(); });
