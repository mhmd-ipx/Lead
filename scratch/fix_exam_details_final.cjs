const fs = require('fs');
const path = 'x:/Projects developments/LEAD Project/src/views/admin/ExamDetails.tsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Line 693 is index 692. We need 5 closing tags.
// 1. </div> for flex-1
// 2. </div> for flex items-start gap-4
// 3. </Card>
// 4. </div> for relative group
// 5. </div> for Draggable wrapper

lines[692] = '                                                                                                </div>';
lines[693] = '                                                                                            </div>';
lines[694] = '                                                                                        </Card>';
lines[695] = '                                                                                    </div>';
lines[696] = '                                                                                </div>';

fs.writeFileSync(path, lines.join('\n'));
console.log('Fixed ExamDetails.tsx tags strictly');
