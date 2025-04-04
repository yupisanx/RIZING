/**
 * Builds a quest filename based on the given parameters
 * @param {string} gender - The gender (e.g., "Male", "Female")
 * @param {string} class - The class (e.g., "Tanker", "Assassin", "Mage", "Healer")
 * @param {string} environment - The environment (e.g., "Gym", "Home")
 * @param {number} frequency - The training frequency in days
 * @returns {string} The formatted filename
 */
function buildQuestFilename(gender, class_, environment, frequency) {
    // Capitalize first letter of each parameter
    const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1);
    const capitalizedClass = class_.charAt(0).toUpperCase() + class_.slice(1);
    const capitalizedEnvironment = environment.charAt(0).toUpperCase() + environment.slice(1);
    
    return `${capitalizedGender}_${capitalizedClass}_${capitalizedEnvironment}_${frequency}days.json`;
}

module.exports = buildQuestFilename; 