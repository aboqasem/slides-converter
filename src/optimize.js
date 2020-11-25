const fs = require('fs');
const shell = require('shelljs');

require('dotenv').config();

const lecturesDir = `${process.env.BASE_DIR}/Lectures`;

fs.readdirSync(lecturesDir).forEach(pdfFileName => {
  if (pdfFileName.includes('Lec')) {
    const dirToPdf = `${lecturesDir}/${pdfFileName}`;
    const dirToOptimizedPdf = `${lecturesDir}/${pdfFileName.replace('.pdf', '_optimized.pdf')}`;
    console.log(`Optimizing ${pdfFileName}...`);
    shell.exec(
      `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/screen -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${dirToOptimizedPdf}" "${dirToPdf}"
      rm "${dirToPdf}"
      mv "${dirToOptimizedPdf}" "${dirToPdf}"`);
    console.log(`Done ${pdfFileName}.`);
  }
});
