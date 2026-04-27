import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, ImageRun, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx'
import JSZip from 'jszip'
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)

export type ExportSettings = {
    format: 'xlsx' | 'docx'
    showQuestionText: boolean
    showOptionText: boolean
    optionLabelType: 'number' | 'alpha' | 'none'
    includeApplicantInfo: boolean
    includeTimestamp: boolean
}

const getOptionLabel = (index: number, type: ExportSettings['optionLabelType']) => {
    if (type === 'none') return ''
    if (type === 'number') return `${index + 1}`
    if (type === 'alpha') return `${String.fromCharCode(65 + index)}`
    return ''
}

const formatJalaliDate = (dateStr: string) => {
    try {
        return dayjs(dateStr).calendar('jalali').format('YYYY/MM/DD HH:mm')
    } catch (e) {
        return dateStr
    }
}

const fetchImageAsArrayBuffer = async (url: string): Promise<ArrayBuffer | null> => {
    try {
        const response = await fetch(url)
        return await response.arrayBuffer()
    } catch (error) {
        console.error('Error fetching image:', error)
        return null
    }
}

export const generateExcelBlob = (data: any[], settings: ExportSettings): Blob => {
    const rows: any[] = []

    data.forEach((result) => {
        rows.push({ 'مورد': 'پاسخنامه آزمون', 'مقدار': result.examTitle })
        if (settings.includeApplicantInfo) {
            rows.push({ 'مورد': 'نام متقاضی', 'مقدار': result.applicantName })
            rows.push({ 'مورد': 'شرکت', 'مقدار': result.companyName })
        }
        if (settings.includeTimestamp) {
            rows.push({ 'مورد': 'تاریخ تکمیل (شمسی)', 'مقدار': formatJalaliDate(result.completedAt) })
        }
        rows.push({})

        result.sections.forEach((section: any) => {
            rows.push({ 'مورد': `بخش: ${section.section_title}` })
            section.questions.forEach((q: any) => {
                const label = q.question_number
                // FIX: Ensure we use the correct flag for question text
                const content = settings.showQuestionText ? (q.question_text || q.text || `سوال ${q.question_number}`) : `سوال ${q.question_number}`
                
                let answerText = ''
                let answerLabel = ''

                if (q.type === 'descriptive') {
                    answerText = q.answer?.text || '---'
                } else if (q.type === 'multiple_choice' || q.type === 'mixed') {
                    const selectedOpt = q.options.find((o: any) => o.index === q.answer?.selected_index)
                    if (selectedOpt) {
                        answerLabel = getOptionLabel(selectedOpt.index, settings.optionLabelType)
                        answerText = settings.showOptionText ? selectedOpt.text : ''
                        if (q.type === 'mixed' && q.answer?.descriptive_text) {
                            answerText += (answerText ? ' ' : '') + `(توضیحات: ${q.answer.descriptive_text})`
                        }
                    } else {
                        answerText = '---'
                    }
                } else if (q.type === 'check_box') {
                    const selected = q.answer?.selected_options || []
                    answerLabel = selected.map((o: any) => getOptionLabel(o.index, settings.optionLabelType)).join(', ')
                    answerText = settings.showOptionText ? selected.map((o: any) => o.text).join(', ') : ''
                } else if (q.type === 'order') {
                    const ordered = q.answer?.ordered_options || []
                    answerLabel = ordered.map((o: any) => `${o.user_priority}: ${getOptionLabel(o.index, settings.optionLabelType)}`).join(' | ')
                    answerText = settings.showOptionText ? ordered.map((o: any) => `${o.user_priority}: ${o.text}`).join(' | ') : ''
                }

                rows.push({
                    'شماره': label,
                    'سوال': content,
                    'لیبل پاسخ': answerLabel,
                    'متن پاسخ': answerText
                })
            })
            rows.push({})
        })
    })

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results')
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export const generateDocxBlob = async (result: any, settings: ExportSettings): Promise<Blob> => {
    const logo1 = await fetchImageAsArrayBuffer('/img/logo/reslogo1.png')
    const logo2 = await fetchImageAsArrayBuffer('/img/logo/reslogo2.png')

    const headerTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
            top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE },
        },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: logo2 ? [new Paragraph({
                            children: [new ImageRun({ data: logo2, transformation: { width: 50, height: 50 }, type: 'png' })],
                            alignment: AlignmentType.LEFT
                        })] : [],
                    }),
                    new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                text: `پاسخنامه آزمون: ${result.examTitle}`,
                                heading: HeadingLevel.HEADING_1,
                                alignment: AlignmentType.CENTER,
                                bidirectional: true,
                            })
                        ],
                    }),
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: logo1 ? [new Paragraph({
                            children: [new ImageRun({ data: logo1, transformation: { width: 50, height: 50 }, type: 'png' })],
                            alignment: AlignmentType.RIGHT
                        })] : [],
                    }),
                ],
            }),
        ],
    })

    const children: any[] = [headerTable]
    children.push(new Paragraph({ text: "", spacing: { before: 200 } }))
    
    if (settings.includeApplicantInfo) {
        children.push(new Paragraph({ 
            children: [new TextRun({ text: `نام متقاضی: ${result.applicantName}`, font: "IRANSans" })], 
            bidirectional: true, alignment: AlignmentType.CENTER 
        }))
        children.push(new Paragraph({ 
            children: [new TextRun({ text: `شرکت: ${result.companyName}`, font: "IRANSans" })], 
            bidirectional: true, alignment: AlignmentType.CENTER 
        }))
    }
    if (settings.includeTimestamp) {
        children.push(new Paragraph({ 
            children: [new TextRun({ text: `تاریخ تکمیل آزمون: ${formatJalaliDate(result.completedAt)}`, font: "IRANSans" })], 
            bidirectional: true, alignment: AlignmentType.CENTER 
        }))
    }
    children.push(new Paragraph({ text: "", spacing: { after: 300 } }))

    for (const section of result.sections) {
        children.push(new Paragraph({
            text: section.section_title,
            heading: HeadingLevel.HEADING_2,
            bidirectional: true,
            shading: { fill: "F3F4F6" }
        }))

        for (const q of section.questions) {
            // FIX: Ensure we use the correct flag for question text
            const questionText = settings.showQuestionText ? (q.question_text || q.text || `سوال ${q.question_number}`) : `سوال ${q.question_number}`
            
            children.push(new Paragraph({
                children: [
                    new TextRun({ text: `${q.question_number}- `, bold: true, font: "IRANSans" }),
                    new TextRun({ text: questionText, bold: true, font: "IRANSans" }),
                ],
                bidirectional: true,
                spacing: { before: 200 }
            }))

            let answerContent: any[] = []
            if (q.type === 'descriptive') {
                answerContent = [new TextRun({ text: q.answer?.text || 'پاسخی داده نشده است', italics: true, font: "IRANSans" })]
            } else if (q.type === 'multiple_choice' || q.type === 'mixed') {
                const selectedOpt = q.options.find((o: any) => o.index === q.answer?.selected_index)
                if (selectedOpt) {
                    const label = getOptionLabel(selectedOpt.index, settings.optionLabelType)
                    const text = settings.showOptionText ? selectedOpt.text : ''
                    answerContent = [new TextRun({ 
                        text: `گزینه انتخابی: ${label}${label && text ? ' - ' : ''}${text}`, 
                        color: "4F46E5", bold: true, font: "IRANSans" 
                    })]
                    if (q.type === 'mixed' && q.answer?.descriptive_text) {
                        answerContent.push(new TextRun({ text: `\nتوضیحات: ${q.answer.descriptive_text}`, break: 1, font: "IRANSans" }))
                    }
                } else {
                    answerContent = [new TextRun({ text: 'پاسخی داده نشده است', color: "EF4444", font: "IRANSans" })]
                }
            } else if (q.type === 'check_box') {
                const selected = q.answer?.selected_options || []
                const labelText = selected.map((o: any) => {
                    const l = getOptionLabel(o.index, settings.optionLabelType)
                    const t = settings.showOptionText ? o.text : ''
                    return `${l}${l && t ? ' - ' : ''}${t}`
                }).join(', ')
                answerContent = [new TextRun({ text: `گزینه‌های انتخابی: ${labelText || '---'}`, color: "4F46E5", font: "IRANSans" })]
            } else if (q.type === 'order') {
                const ordered = q.answer?.ordered_options || []
                const labelText = ordered.map((o: any) => {
                    const l = getOptionLabel(o.index, settings.optionLabelType)
                    const t = settings.showOptionText ? o.text : ''
                    return `${o.user_priority}: ${l}${l && t ? ' - ' : ''}${t}`
                }).join(' | ')
                answerContent = [new TextRun({ text: `اولویت‌بندی: ${labelText || '---'}`, color: "4F46E5", font: "IRANSans" })]
            }

            children.push(new Paragraph({
                children: answerContent,
                bidirectional: true,
                indent: { left: 400 },
                spacing: { after: 100 }
            }))
        }
    }

    const doc = new Document({
        sections: [{
            properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
            children: children,
        }],
    })

    return await Packer.toBlob(doc)
}

export const exportToZip = async (results: any[], settings: ExportSettings, zipFilename: string) => {
    const zip = new JSZip()
    for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const filename = `${result.applicantName}-${result.examTitle}-${i + 1}`
        if (settings.format === 'docx') {
            const blob = await generateDocxBlob(result, settings)
            zip.file(`${filename}.docx`, blob)
        } else {
            const blob = generateExcelBlob([result], settings)
            zip.file(`${filename}.xlsx`, blob)
        }
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, `${zipFilename}.zip`)
}
