const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

function readFile(path) {
  try {
    return fs.readFileSync(path, 'utf8');
  } catch {
    return null;
  }
}

app.get('/', (_req, res) => {
  res.send(`
    <h1>✅ Kubernetes ConfigMap & Secret Demo</h1>
    <h2>Environment Variables</h2>
    <pre>
APP_NAME=${process.env.APP_NAME}
LOG_LEVEL=${process.env.LOG_LEVEL}
DB_HOST=${process.env.DB_HOST}
DB_USER=${process.env.DB_USER}
DB_PASSWORD=${process.env.DB_PASSWORD ? "*** set ***" : ""}
    </pre>
    <h2>Mounted Files</h2>
    <pre>
/etc/config/app-config.json: ${readFile('/etc/config/app-config.json')}
 /etc/secret/api-key: ${readFile('/etc/secret/api-key') ? "*** present ***" : ""}
    </pre>
  `);
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
