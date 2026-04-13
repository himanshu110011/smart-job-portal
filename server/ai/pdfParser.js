const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extracts raw text from a PDF file.
 * @param {string} filePath - Path to the PDF file.
 * @returns {Promise<string>} - Extracted text.
 */
const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text;
    } catch (error) {
        console.error("PDF Parsing Error:", error);
        throw new Error("Failed to extract text from PDF document");
    }
};

module.exports = { extractTextFromPDF };
