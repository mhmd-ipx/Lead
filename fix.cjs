const fs = require('fs');
const file = "x:\\Projects developments\\LEAD Project\\src\\views\\admin\\ExamDetails.tsx";
let code = fs.readFileSync(file, 'utf8');

const replacement = `                        <div className="absolute top-0 bottom-0 right-6 md:right-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0 h-full"></div>
                        <div className="space-y-12">
                            {sections.map((section, index) => (
                                <div key={section.id} className="relative z-10">
                                    {/* Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 group">
                                        <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700 z-10 relative shrink-0 mx-auto sm:mx-0">
                                            <span className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => toggleSection(section.id)}>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">
                                                        {section.title}
                                                    </h2>
                                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-semibold rounded-full border border-blue-100">
                                                        {section.questions?.length || 0} سوال
                                                    </span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1" dangerouslySetInnerHTML={{ __html: section.content || 'بدون توضیحات' }} />
                                            </div>
                                            <div className="flex items-center justify-end gap-1 w-full sm:w-auto border-t sm:border-0 border-gray-100 dark:border-gray-700 pt-2 sm:pt-0">
                                                <Button 
                                                    variant="plain" 
                                                    shape="circle" 
                                                    size="sm" 
                                                    icon={<HiOutlinePencil />} 
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        setEditingSectionContentId(editingSectionContentId === section.id ? null : section.id) 
                                                        if (!section.isExpanded) {
                                                            toggleSection(section.id)
                                                        }
                                                    }} 
                                                    className={editingSectionContentId === section.id ? 'text-primary-600' : 'text-gray-500'}
                                                />
                                                <Button variant="plain" shape="circle" size="sm" icon={<HiOutlineTrash />} onClick={(e) => { e.stopPropagation(); deleteSection(section.id) }} className="text-red-500 hover:text-red-600 hover:bg-red-50" />
                                                {section.isExpanded ? <HiOutlineChevronUp /> : <HiOutlineChevronDown />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    {section.isExpanded && (`;

code = code.replace(/<div className="absolute top-0 bottom-0 right-6 md:right-8 w-0.5 bg-gray-200 dark:bg-gray-700 z-0 h-full"><\/div>[\s\S]*?{\/\* Body \*\/}[\s\S]*?{section\.isExpanded && \(/, replacement);

fs.writeFileSync(file, code);
