const fs = require('fs');
const { parseHar } = require('./harParser');
const { generateSpec } = require('./specGenerator');

function convertHarToCypress(harPath, outputPath) {
  const harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
  const requests = parseHar(harContent);
  const specContent = generateSpec(requests);
  fs.mkdirSync('cypress/e2e/generated', { recursive: true });
  fs.writeFileSync(outputPath, specContent);
}

// Handle command line arguments
if (process.argv.length < 4) {
  console.log('Usage: node src/index.js <input.har> <output.spec.js>');
  process.exit(1);
}

convertHarToCypress(process.argv[2], process.argv[3]);
