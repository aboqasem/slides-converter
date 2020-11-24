const fs = require('fs');
const { createWorker } = require('tesseract.js');
const { PDFDocument } = require('pdf-lib');

require('dotenv').config();

const worker = createWorker();

// absolute path
const baseDir = process.env.BASE_DIR;

// directories
const forExtractionDir = `${baseDir}/Lectures for extraction`;
const lecturesDir = `${baseDir}/Lectures`;

try {
  const lectureFolderNames = fs.readdirSync(forExtractionDir).filter((value) => value.includes('Lec'));

  (async () => {
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');

    for (const lectureFolderName of lectureFolderNames) {
      console.log(`Converting ${lectureFolderName}...`);
      const pdfDocument = await PDFDocument.create();
      let pageNumber = 1;

      const lecturePageFileNames = fs.readdirSync(`${forExtractionDir}/${lectureFolderName}`);
      for (const lecturePageFileName of lecturePageFileNames) {
        if (lecturePageFileName.includes('Screenshot')) {
          console.log(`Converting page ${pageNumber} of ${lectureFolderName}...`);
          const lecturePageDir = `${forExtractionDir}/${lectureFolderName}/${lecturePageFileName}`;

          const { data: { text } } = await worker.recognize(lecturePageDir);

          const pdfPage = pdfDocument.addPage(
            [parseInt(process.env.PAGE_WIDTH), parseInt(process.env.PAGE_HEIGHT)]);

          const pdfLecturePage = await pdfDocument.embedPng(fs.readFileSync(lecturePageDir));

          pdfPage.drawImage(pdfLecturePage, {
            x: 0,
            y: 0,
            width: pdfPage.getSize().width,
            height: pdfPage.getSize().height,
          });

          pdfPage.drawText(text, {
            x: 28,
            y: pdfPage.getSize().height - 70,
            size: 12,
            opacity: 0,
          });
          console.log(`Done page ${pageNumber++} of ${lectureFolderName}.`);
        }
      }
      fs.writeFileSync(`${lecturesDir}/${lectureFolderName}.pdf`, await pdfDocument.save());
      console.log(`Done ${lectureFolderName} and saved it as a PDF file in: ${lecturesDir}`);
    }

    await worker.terminate();
  })();
} catch (e) {
  worker.terminate()
    .then()
    .catch((reason) => {
      console.error(reason);
    });
  console.error(e.message);
}
