/**
 * Advanced Job Matcher Algorithm
 * Provides a more sophisticated matching logic between a candidate's profile and job requirements.
 */

const calculateMatchScore = (candidateSkills, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) return 100;
    if (!candidateSkills || candidateSkills.length === 0) return 0;

    const lowerCandidateSkills = candidateSkills.map(s => s.toLowerCase().trim());
    let matchScore = 0;

    requiredSkills.forEach(reqSkill => {
        const lowerReqSkill = reqSkill.toLowerCase().trim();
        
        // 1. Exact Match
        if (lowerCandidateSkills.includes(lowerReqSkill)) {
            matchScore += 1;
        } else {
            // 2. Partial/Substring Match Check (e.g., "React.js" matching "React", "Node" matching "Node.js")
            // This makes the algorithm a bit 'smarter'
            const isPartialMatch = lowerCandidateSkills.some(candSkill => {
                // To avoid matching "c" with "css", we impose a minimum length for partial matches
                if (candSkill.length > 2 && lowerReqSkill.length > 2) {
                    return candSkill.includes(lowerReqSkill) || lowerReqSkill.includes(candSkill);
                }
                return false;
            });
            
            if (isPartialMatch) {
                matchScore += 0.5; // Partial match gives half credit
            }
        }
    });

    const matchPercentage = Math.round((matchScore / requiredSkills.length) * 100);
    return Math.min(matchPercentage, 100); // Cap at 100% just in case
};

/**
 * Ranks a list of jobs based on the candidate's skills
 * @param {Array} candidateSkills - Array of string skills
 * @param {Array} activeJobs - Array of job objects containing requiredSkills
 * @param {Number} threshold - Minimum acceptable match percentage (default 20)
 */
const rankJobsForCandidate = (candidateSkills, activeJobs, threshold = 20) => {
    let recommendations = activeJobs.map(job => {
        const matchScore = calculateMatchScore(candidateSkills, job.requiredSkills);
        return {
            job,
            matchScore
        };
    });

    // Filter by threshold and Sort by highest match descending
    return recommendations
        .filter(r => r.matchScore >= threshold)
        .sort((a, b) => b.matchScore - a.matchScore);
};

module.exports = { 
    calculateMatchScore, 
    rankJobsForCandidate 
};
