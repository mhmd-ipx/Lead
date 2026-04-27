const fs = require('fs');
const path = 'x:/Projects developments/LEAD Project/src/views/admin/ExamDetails.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Line 693 is index 692
lines[692] = '                                                                                                </div>';
lines[693] = '                                                                                            </div>';
lines[694] = '                                                                                        </Card>';

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed tags by line numbers');
