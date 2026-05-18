const fs = require('fs');

const filePath = 'x:/Projects developments/LEAD Project/src/views/manager/MyExamStart.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const targetStart = `map((q: any, index: number) => (() => {`;
const replacementStart = `map((q: any, index: number) => {`;

const targetEnd = `})())}`;
const replacementEnd = `})}`;

if (!content.includes(targetStart)) {
    console.error("Error: Target start not found!");
    process.exit(1);
}
content = content.replace(targetStart, replacementStart);

if (!content.includes(targetEnd)) {
    console.error("Error: Target end not found!");
    process.exit(1);
}
content = content.replace(targetEnd, replacementEnd);

// Convert back to CRLF
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Success! Syntax fixed successfully!");
