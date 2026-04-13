const { extractTextFromPDF } = require('./pdfParser');
const { extractSkills, extractBasicInfo } = require('./skillExtractor');

/**
 * Orchestrates the full resume parsing pipeline.
 * Coordinates reading the PDF and pushing text to the extraction engine.
 * @param {string} filePath - Path to the PDF file on disk.
 * @returns {Promise<Object>} - Consolidated parsed resume profile.
 */
const parseResumeFile = async (filePath) => {
    try {
        // 1. Fetch raw text payload
        const rawText = await extractTextFromPDF(filePath);
        
        // 2. Pass to intelligence extractors
        const skills = extractSkills(rawText);
        const { email } = extractBasicInfo(rawText);
        
        // 3. Spigot structured profile back to Controller
        return {
            rawText,
            skills,
            email
        };
    } catch (error) {
        console.error("Resume parsing orchestration error:", error);
        throw new Error("Failed to process resume document");
    }
};

module.exports = { parseResumeFile };
