const fs = require('fs');

const filePath = 'x:/Projects developments/LEAD Project/src/views/manager/MyExamStart.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF
content = content.replace(/\r\n/g, '\n');

const target = `                                </Card>
                            })
                        </div>`;

const replacement = `                                </Card>
                            )
                        })}
                        </div>`;

if (!content.includes(target)) {
    console.error("Error: Target not found!");
    process.exit(1);
}
content = content.replace(target, replacement);

// Convert back to CRLF
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Success! Final braces fixed successfully!");
