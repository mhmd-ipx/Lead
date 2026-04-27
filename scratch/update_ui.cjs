const fs = require('fs');
const path = 'x:/Projects developments/LEAD Project/src/views/admin/ExamDetails.tsx';
let content = fs.readFileSync(path, 'utf8');

// Compact Card and Title
content = content.replace(
    /<Card className="hover:shadow-md border-l-4 border-l-transparent hover:border-l-primary-500 group" bodyClass="p-5">/g,
    '<Card className="hover:shadow-md border-l-4 border-l-transparent hover:border-l-primary-500 group transition-all duration-200" bodyClass="p-4">'
);

content = content.replace(
    /<div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 font-bold shrink-0 mt-1">/g,
    '<div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 text-xs font-bold shrink-0">'
);

content = content.replace(
    /<h3 className="font-semibold text-gray-800 line-clamp-2" dangerouslySetInnerHTML={{ __html: question.title }}><\/h3>/g,
    `<div className="flex items-start justify-between gap-4">
                                                                                                        <h3 className="font-semibold text-gray-800 text-[15px] leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: question.title }}></h3>
                                                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                                                                            <span className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-500 rounded font-medium mr-2">
                                                                                                                {question.type === 'multiple_choice' ? 'تستی' : 
                                                                                                                 question.type === 'descriptive' ? 'تشریحی' :
                                                                                                                 question.type === 'mixed' ? 'تستی-تشریحی' : 'اولویت‌بندی'}
                                                                                                            </span>
                                                                                                            <Button size="xs" variant="plain" icon={<HiOutlinePencil />} onClick={() => openQuestionForm(section.id, question)} />
                                                                                                            <Button size="xs" variant="plain" icon={<HiOutlineTrash />} onClick={() => deleteQuestionFromSection(section.id, question.id!)} className="text-red-500" />
                                                                                                        </div>
                                                                                                    </div>`
);

// Shrink images
content = content.replace(/className="h-32 w-auto rounded-lg border object-cover"/g, 'className="h-24 w-auto rounded border object-cover"');
content = content.replace(/className="h-10 w-auto rounded border"/g, 'className="h-8 w-auto rounded border"');
content = content.replace(/className="text-sm p-2 rounded border border-gray-100 bg-gray-50 text-gray-600 flex items-center gap-2"/g, 'className="text-[13px] p-1.5 rounded border border-gray-100 bg-gray-50 text-gray-600 flex items-center gap-2"');
content = content.replace(/className="w-5 h-5 rounded-full bg-white border flex items-center justify-center text-\[10px\] font-bold"/g, 'className="w-4 h-4 rounded-full bg-white border flex items-center justify-center text-[9px] font-bold shrink-0"');

// Remove bottom actions
content = content.replace(
    /<div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/m,
    '</div></div>'
);

fs.writeFileSync(path, content);
console.log('Successfully updated ExamDetails.tsx');
