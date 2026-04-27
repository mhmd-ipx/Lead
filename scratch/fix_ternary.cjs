const fs = require('fs');
const path = 'x:/Projects developments/LEAD Project/src/views/admin/ExamDetails.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

lines[696] = '                                                                                )}';

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed ternary closing tag in ExamDetails.tsx');
