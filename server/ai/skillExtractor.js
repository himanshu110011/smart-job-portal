const skillDictionary = require('./skillKeywords');

/**
 * Extracts technical skills from raw text using the skill dictionary.
 * @param {string} text - The raw text from the resume.
 * @returns {Array<string>} - List of extracted skills.
 */
const extractSkills = (text) => {
    if (!text) return [];
    
    const lowercaseText = text.toLowerCase();
    
    return skillDictionary.filter(skill => {
        // Use non-capturing groups with \W (non-word char) or ^/$ boundaries instead of strict \b
        // This properly matches skills that end or begin with special chars like c++, c#, .net
        const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(?:^|\\W)${escapedSkill}(?:\\W|$)`, 'i');
        return regex.test(lowercaseText);
    });
};

/**
 * Extracts basic user information like email.
 * @param {string} text - The raw text from the resume.
 * @returns {Object} - Object containing extracted info.
 */
const extractBasicInfo = (text) => {
    if (!text) return { email: null };

    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
    const emailMatch = text.match(emailRegex);
    
    return {
        email: emailMatch ? emailMatch[0] : null
    };
};

module.exports = { extractSkills, extractBasicInfo };
