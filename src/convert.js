const fs = require('fs');
const { createWorker } = require('tesseract.js');
const { PDFDocument, StandardFonts } = require('pdf-lib');

require('dotenv').config();

const worker = createWorker();

// to filter unaccepted characters
String.prototype.replaceCharAt = function (index, replacement) {
  return this.substring(0, index) + replacement + this.substring(index + 1);
};

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
        if (lecturePageFileName.includes(process.env.IMAGE_NAME_CONTAINS)) {
          const lecturePageDir = `${forExtractionDir}/${lectureFolderName}/${lecturePageFileName}`;
          console.log(`Converting page ${pageNumber} of ${lectureFolderName}: ${lecturePageDir}...`);

          let { data: { text: recognizedText } } = await worker.recognize(lecturePageDir);

          // to filter unaccepted characters
          const pdfFont = await pdfDocument.embedFont(StandardFonts.TimesRoman);
          const acceptedCharacterCodes = pdfFont.getCharacterSet();
          // filter unaccepted characters
          for (let i = 0; i < recognizedText.length; ++i) {
            if (!acceptedCharacterCodes.includes(recognizedText.charCodeAt(i))) {
              recognizedText = recognizedText.replaceCharAt(i, ' ');
            }
          }

          let line = '';
          const shortLinesOfRecognizedText = [];
          recognizedText.split(/\s+/).forEach((value, index, array) => {
            line += value + ' ';
            if (line.length > 125 && line.length < 140) {
              shortLinesOfRecognizedText.push(line.trimEnd());
              line = '';
            } else if (index === array.length - 1) {
              shortLinesOfRecognizedText.push(line.trimEnd());
            }
          });

          const drawableText = shortLinesOfRecognizedText.join('\n');

          const pdfPage = pdfDocument.addPage(
            [parseInt(process.env.PAGE_WIDTH), parseInt(process.env.PAGE_HEIGHT)]);

          const pdfLecturePage = await pdfDocument.embedPng(fs.readFileSync(lecturePageDir));

          pdfPage.drawImage(pdfLecturePage, {
            x: 0,
            y: 0,
            width: pdfPage.getSize().width,
            height: pdfPage.getSize().height,
          });

          pdfPage.drawText(drawableText, {
            x: 0,
            y: pdfPage.getSize().height - 10,
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
