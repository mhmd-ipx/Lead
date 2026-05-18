const fs = require('fs');
const content = fs.readFileSync('x:/Projects developments/LEAD Project/src/views/manager/MyExamStart.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 30; i < 40; i++) {
    console.log(`${i + 1}: ${JSON.stringify(lines[i])}`);
}
