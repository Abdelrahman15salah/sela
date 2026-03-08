const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir('g:/coding/sela/frontend/src', function (filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.css')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = content.replace(/stone-/g, 'slate-');
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log('Updated', filePath);
        }
    }
});
