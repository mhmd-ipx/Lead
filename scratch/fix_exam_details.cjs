const fs = require('fs');
const path = 'x:/Projects developments/LEAD Project/src/views/admin/ExamDetails.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix the messy closing and add drag handle
content = content.replace(
    /<Button size="xs" variant="plain" icon={<HiOutlineTrash \/>} onClick={() => deleteQuestionFromSection\(section.id, question.id!\)} className="text-red-500" \/>\s+<\/div>\s+<\/div>/g,
    `<Button size="xs" variant="plain" icon={<HiOutlineTrash />} onClick={() => deleteQuestionFromSection(section.id, question.id!)} className="text-red-500" />
                                                                                                            <div {...provided.dragHandleProps} className="p-1 text-gray-400 hover:text-gray-600 cursor-move">
                                                                                                                <HiOutlineSelector />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>`
);

fs.writeFileSync(path, content);
console.log('Fixed ExamDetails.tsx closing tags and drag handle');
