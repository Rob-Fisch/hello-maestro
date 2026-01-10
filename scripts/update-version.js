const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');
const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');
const CURRENT_VERSION_TXT_PATH = path.join(__dirname, '..', 'public', 'CurrentVersion.txt');

function incrementVersion(version, type) {
    const parts = version.split('.').map(Number);
    if (type === 'major') {
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
    } else if (type === 'minor') {
        parts[1]++;
        parts[2] = 0;
    } else if (type === 'patch') {
        parts[2]++;
    }
    return parts.join('.');
}

function run() {
    const type = process.argv[2];
    if (!['major', 'minor', 'patch', 'build'].includes(type)) {
        console.error('Usage: node update-version.js [major|minor|patch|build]');
        process.exit(1);
    }

    // 1. Read app.json
    const appJsonRaw = fs.readFileSync(APP_JSON_PATH, 'utf8');
    const appJson = JSON.parse(appJsonRaw);
    let version = appJson.expo.version;
    let buildNumber = parseInt(appJson.expo.extra.buildNumber || '0', 10);

    // 2. Increment logic
    if (type === 'build') {
        buildNumber++;
    } else {
        version = incrementVersion(version, type);
        buildNumber++; // Always bump build number on version change too
    }

    const newBuildNumberString = buildNumber.toString();

    // 3. Update app.json
    appJson.expo.version = version;
    appJson.expo.extra.buildNumber = newBuildNumberString;
    fs.writeFileSync(APP_JSON_PATH, JSON.stringify(appJson, null, 2) + '\n');
    console.log(`Updated app.json: ${version} (Build ${newBuildNumberString})`);

    // 4. Update package.json
    const packageJsonRaw = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
    const packageJson = JSON.parse(packageJsonRaw);
    packageJson.version = version;
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Updated package.json: ${version}`);

    // 5. Generate public/CurrentVersion.txt
    const txtContent = `${version} (Build ${newBuildNumberString})`;
    fs.writeFileSync(CURRENT_VERSION_TXT_PATH, txtContent);
    console.log(`Generated public/CurrentVersion.txt: ${txtContent}`);

    // 6. Update public/sw.js (CRITICAL for PWA Update Detection)
    const SW_PATH = path.join(__dirname, '..', 'public', 'sw.js');
    if (fs.existsSync(SW_PATH)) {
        let swContent = fs.readFileSync(SW_PATH, 'utf8');
        // Regex to match "const VERSION = '...';"
        const versionRegex = /const VERSION = '.*?';/;
        const newVersionLine = `const VERSION = '${version} (Build ${newBuildNumberString})';`;

        if (versionRegex.test(swContent)) {
            swContent = swContent.replace(versionRegex, newVersionLine);
            fs.writeFileSync(SW_PATH, swContent);
            console.log(`Updated public/sw.js to: ${newVersionLine}`);
        } else {
            console.warn('WARNING: Could not find VERSION line in public/sw.js to update.');
        }
    }

    // 7. Git Stage
    try {
        execSync(`git add ${APP_JSON_PATH} ${PACKAGE_JSON_PATH} ${CURRENT_VERSION_TXT_PATH} ${SW_PATH}`);
        console.log('Staged files to git.');
    } catch (e) {
        console.warn('Failed to stage files to git:', e.message);
    }

    console.log(`\nSUCCESS! Bumped to ${version} (Build ${newBuildNumberString})`);
}

run();
