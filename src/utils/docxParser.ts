import mammoth from 'mammoth';

export async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  if (!result.value || result.value.trim().length === 0) {
    // If raw text is empty, attempt html conversion and strip tags
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlResult.value;
    return tmp.textContent || tmp.innerText || '';
  }
  return result.value;
}

export async function parseDocumentFile(file: File): Promise<{ content: string; type: 'docx' | 'markdown' | 'text' }> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    const text = await extractTextFromDocx(file);
    return { content: text, type: 'docx' };
  } else if (fileName.endsWith('.md') || fileName.endsWith('.markdown')) {
    const text = await file.text();
    return { content: text, type: 'markdown' };
  } else {
    const text = await file.text();
    return { content: text, type: 'text' };
  }
}
