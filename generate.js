const fs = require('fs');
const path = require('path');

const issueBody = process.env.ISSUE_BODY || '';

// Extract Name and Link from Issue Body
const nameMatch = issueBody.match(/Name:\s*(.+)/i);
const linkMatch = issueBody.match(/Link:\s*(.+)/i);

if (!nameMatch || !linkMatch) {
    console.error("Error: Name ya Link missing hai!");
    process.exit(1);
}

const name = nameMatch[1].trim();
let link = linkMatch[1].trim();

// Format File Name (e.g. "My Page" -> "my-page.html")
const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.html';

if (!link.startsWith('http://') && !link.startsWith('https://')) {
    link = 'https://' + link;
}

// 1. Save data to data.json
const jsonPath = path.join(__dirname, 'data.json');
let currentData = [];

if (fs.existsSync(jsonPath)) {
    try {
        currentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (e) {
        currentData = [];
    }
}

currentData.push({ name, link, fileName, createdAt: new Date() });
fs.writeFileSync(jsonPath, JSON.stringify(currentData, null, 2));

// 2. Create the HTML Page with dynamic link inside iframe
const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { height: 100%; overflow: hidden; }
      .iframe-container { width: 100%; height: 100vh; background: #fff; }
      iframe { width: 100%; height: 100%; border: none; display: block; }
    </style>
  </head>
  <body>
    <div class="iframe-container">
      <iframe
        id="preview-iframe"
        src="${link}"
        sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-popups allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation"
        allow="accelerometer; autoplay; camera; encrypted-media; fullscreen; geolocation; gyroscope; microphone; midi; clipboard-read; clipboard-write; usb; vr; xr-spatial-tracking; screen-wake-lock; magnetometer; ambient-light-sensor; battery; gamepad; picture-in-picture; display-capture; bluetooth;"
        referrerpolicy="origin-when-cross-origin"
      ></iframe>
    </div>
  </body>
</html>`;

fs.writeFileSync(path.join(__dirname, fileName), htmlContent);
console.log(`Successfully created ${fileName} and updated data.json`);
