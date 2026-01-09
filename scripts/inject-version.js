const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist', 'index.html');
const versionPath = path.join(__dirname, '..', 'public', 'CurrentVersion.txt');

if (fs.existsSync(distPath) && fs.existsSync(versionPath)) {
    const version = fs.readFileSync(versionPath, 'utf8').trim();
    let html = fs.readFileSync(distPath, 'utf8');

    // Remove existing signature if present
    html = html.replace(/<!-- Build Version: .*? -->\s*$/, '');

    // Append new signature
    const signature = `\n<!-- Build Version: ${version} - ${new Date().toISOString()} -->`;
    fs.writeFileSync(distPath, html + signature);
    console.log(`Injected "${version}" into dist/index.html`);
} else {
    console.error('Could not find dist/index.html or public/CurrentVersion.txt');
    process.exit(1);
}
