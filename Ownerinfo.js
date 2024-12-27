const fs = require('fs-extra');

// Owner information
const ownerInfo = {
    name: "Jayden Smith",
    age: 22,
    facebook: "https://www.facebook.com/lordjaydenSmith.1",
    github: "https://github.com/LordKing2",
    telegram: "@jaydensmith",
    linkedin: "https://www.linkedin.com/in/jaydenSmith",
    instagram: "https://www.instagram.com/jaylordsmith6930",
    messengerSupportGroup: "https://m.me/j/AbZ6Bj-uS3npg7di/"
};

// Function to save owner information to a file
function saveOwnerInfoToFile(filePath) {
    fs.writeFile(filePath, JSON.stringify(ownerInfo, null, 2), (err) => {
        if (err) {
            console.error("Error saving owner information:", err);
        } else {
            console.log("Owner information saved successfully.");
        }
    });
}

// Save the owner information to Ownerinfo.js
saveOwnerInfoToFile('./Ownerinfo.js');
