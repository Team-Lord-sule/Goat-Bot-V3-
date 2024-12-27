const fs = require("fs-extra");
const readline = require("readline");
const log = require('./logger/log.js');

let versionBackup;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading file from disk: ${err}`);
    }
}

async function writeJsonFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Data written to file ${filePath}`);
    } catch (err) {
        console.error(`Error writing file to disk: ${err}`);
    }
}

function recursiveReadDirAndBackup(pathFileOrFolder) {
    const pathFileOrFolderBackup = `${process.cwd()}/${versionBackup}/${pathFileOrFolder}`;
    const pathFileOrFolderRestore = `${process.cwd()}/${pathFileOrFolder}`;

    if (fs.lstatSync(pathFileOrFolderBackup).isDirectory()) {
        if (!fs.existsSync(pathFileOrFolderRestore))
            fs.mkdirSync(pathFileOrFolderRestore);
        const readDir = fs.readdirSync(pathFileOrFolderBackup);
        readDir.forEach(fileOrFolder => {
            recursiveReadDirAndBackup(`${pathFileOrFolder}/${fileOrFolder}`);
        });
    } else {
        pathFileOrFolder = pathFileOrFolder.replace(/\\/g, '/');
        fs.copyFileSync(pathFileOrFolderBackup, pathFileOrFolderRestore);
    }
}

(async () => {
    if (process.argv.length < 3) {
        versionBackup = await new Promise((resolve) => {
            rl.question("Input version backup: ", answer => {
                resolve(answer);
            });
        });
    } else {
        versionBackup = process.argv[2];
    }

    if (!versionBackup) {
        log.error("ERROR", `Please input version backup`);
        process.exit();
    }

    versionBackup = versionBackup.replace("backup_", ""); // remove backup_ if exists (may be user input backup_1.0.0)
    versionBackup = `backup_${versionBackup}`;

    const backupFolder = `${process.cwd()}/backups/${versionBackup}`;
    if (!fs.existsSync(backupFolder)) {
        log.error("ERROR", `Backup folder is not exists (${backupFolder})`);
        process.exit();
    }

    const files = fs.readdirSync(backupFolder);
    for (const file of files)
        recursiveReadDirAndBackup(file);

    const packageJson = await readJsonFile(`${process.cwd()}/package.json`);
    packageJson.version = versionBackup.replace("backup_", "");
    await writeJsonFile(`${process.cwd()}/package.json`, packageJson);

    // Read owner information from Ownerinfo.js
    const ownerInfo = await readJsonFile('./Ownerinfo.js');
    console.log("Owner Information:", ownerInfo);

    // Read bot details and other information from backup.js
    const backupData = await readJsonFile('./backup.js');
    console.log("Backup Data:", backupData);

    // Integrate additional information into the restored data
    // Assuming backupData has fields like bankBalances, lastUsed, updatedAt
    backupData.ownerInfo = ownerInfo;
    backupData.lastRestored = new Date().toISOString();

    // Save the updated backup data back to backup.js
    await writeJsonFile('./backup.js', backupData);

    log.info("SUCCESS", `Restore backup ${versionBackup} success`);
})();
