const pdfParse = require('pdf-parse');
const fs = require('fs');

// Extensive mock dictionary of tech skills
const skillDictionary = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'go', 'rust',
    'react', 'angular', 'vue', 'svelte', 'react native', 'flutter', 'ionic',
    'node.js', 'express', 'django', 'flask', 'spring boot', 'asp.net', 'laravel', 'ruby on rails',
    'mongodb', 'postgresql', 'mysql', 'sql server', 'sqlite', 'redis', 'cassandra', 'elasticsearch',
    'docker', 'kubernetes', 'jenkins', 'gitlab ci', 'github actions', 'terraform', 'ansible',
    'aws', 'azure', 'google cloud', 'gcp', 'heroku', 'digitalocean',
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui',
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'trello', 'agile', 'scrum',
    'machine learning', 'deep learning', 'nlp', 'computer vision', 'data science', 'pandas', 'numpy', 'scipy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras',
    'blockchain', 'web3', 'smart contracts', 'solidity', 'ethereum',
    'cybersecurity', 'penetration testing', 'ethical hacking', 'cryptography', 'network security',
    'ui/ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator',
    'rest api', 'graphql', 'grpc', 'websockets', 'microservices', 'serverless',
    'linux', 'unix', 'bash', 'powershell', 'shell scripting'
];

const parseResumeFile = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);

        const text = data.text.toLowerCase();
        
        // Extract skills by checking text against dictionary
        const extractedSkills = skillDictionary.filter(skill => {
            // Using word boundary regex to avoid partial matches (e.g. 'go' matching 'good')
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(text);
        });

        // Basic Info Extraction (Extremely simplified)
        const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
        const emailMatch = text.match(emailRegex);
        
        return {
            rawText: data.text,
            skills: extractedSkills,
            email: emailMatch ? emailMatch[0] : null
        };
    } catch (error) {
        console.error("Resume parsing error:", error);
        throw new Error("Failed to parse resume document");
    }
};

const calculateMatchPercentage = (candidateSkills, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!candidateSkills || candidateSkills.length === 0) return 0;

    const lowerCandidateSkills = candidateSkills.map(s => s.toLowerCase());
    let matchCount = 0;

    requiredSkills.forEach(reqSkill => {
        if (lowerCandidateSkills.includes(reqSkill.toLowerCase().trim())) {
            matchCount++;
        }
    });

    return Math.round((matchCount / requiredSkills.length) * 100);
};

module.exports = { parseResumeFile, calculateMatchPercentage };
