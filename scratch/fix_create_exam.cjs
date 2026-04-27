const fs = require('fs');
const path = 'x:/Projects developments/LEAD Project/src/views/admin/CreateExam.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the messy closing
content = content.replace(
    /<\/div>\s+<\/div>\s+<\/div>\s+<\/div>\s+<\/Card>/g,
    `</div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </Card>`
);

// Also fix the double div at the bottom of the question content
content = content.replace(/<\/div><\/div>\s+<\/div>\s+<\/div>/g, '</div></div>');

fs.writeFileSync(path, content);
console.log('Fixed CreateExam.tsx closing tags');
