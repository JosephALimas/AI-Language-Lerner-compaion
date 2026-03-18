const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '..');
const srcDir = path.join(backendRoot, 'src');
const distDir = path.join(backendRoot, 'dist');

const removeDirectory = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    return;
  }

  try {
    fs.rmSync(directoryPath, { recursive: true, force: true });
    return;
  } catch (error) {
    if (process.platform === 'win32') {
      execSync(`cmd /c rmdir /s /q "${directoryPath}"`);
      return;
    }

    execSync(`rm -rf "${directoryPath}"`);
  }
};

const copyDirectory = (sourceDir, targetDir) => {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    if (path.extname(entry.name) === '.ts') {
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
};

removeDirectory(distDir);
fs.mkdirSync(distDir, { recursive: true });
copyDirectory(srcDir, distDir);

console.log(`Backend build completed: copied runtime sources to ${distDir}`);
