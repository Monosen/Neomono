const fs = require('fs');
const path = require('path');

const target = process.argv[2];

if (!['vscode', 'ovsx'].includes(target)) {
  console.error('Please specify a target: vscode or ovsx');
  process.exit(1);
}

const badges = {
  vscode: `
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/v/Monosen.neomono?style=for-the-badge&color=C792EA&logo=visual-studio-code" alt="Version" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/d/Monosen.neomono?style=for-the-badge&color=89DDFF&logo=visual-studio-code" alt="Downloads" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=Monosen.neomono">
      <img src="https://img.shields.io/visual-studio-marketplace/r/Monosen.neomono?style=for-the-badge&color=C3E88D&logo=visual-studio-code" alt="Rating" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=for-the-badge&color=f07178&logo=github" alt="License" />
    </a>
  </p>`,
  ovsx: `
  <p>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/v/Monosen/neomono?style=for-the-badge&color=C792EA&logo=open-vsx" alt="Version" />
    </a>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/dt/Monosen/neomono?style=for-the-badge&color=89DDFF&logo=open-vsx" alt="Downloads" />
    </a>
    <a href="https://open-vsx.org/extension/Monosen/neomono">
      <img src="https://img.shields.io/open-vsx/r/Monosen/neomono?style=for-the-badge&color=C3E88D&logo=open-vsx" alt="Rating" />
    </a>
    <a href="https://github.com/Monosen/Neomono/blob/master/LICENSE">
      <img src="https://img.shields.io/github/license/Monosen/Neomono?style=for-the-badge&color=f07178&logo=github" alt="License" />
    </a>
  </p>`
};

const files = [
  path.join(__dirname, '../README.md'),
  path.join(__dirname, '../README.es.md')
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    const regex = /<!-- BADGES_START -->[\s\S]*?<!-- BADGES_END -->/;
    const replacement = `<!-- BADGES_START -->${badges[target]}\n  <!-- BADGES_END -->`;
    
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`Updated badges in ${path.basename(file)} to ${target}`);
    } else {
      console.warn(`Markers not found in ${path.basename(file)}`);
    }
  } else {
    console.warn(`File not found: ${file}`);
  }
});
