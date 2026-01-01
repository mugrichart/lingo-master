import { Injectable } from '@nestjs/common';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// For Node environments, you must point to the worker
import { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

@Injectable()
export class PdfService {
  
  async getPdf(url: string) {
    const res = await fetch(url);
    const buffer = new Uint8Array(await res.arrayBuffer());

    // In Node.js, pdfjs needs the workerSrc set or it might fail
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    return await loadingTask.promise;
  }

  async getPageContent(pdf: pdfjsLib.PDFDocumentProxy, pageNumber: number = 0): Promise<string> {
    // You must ensure the pageNumber exists; pdf.numPages is the total count.
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    
    return this.pdfTextContentToText(content);
  }

  private pdfTextContentToText(textContent: TextContent): string {
    const lines: string[] = [];
    let current = "";

    for (const item of textContent.items) {
      // Logic Check: 'item' can be a TextItem or AnnotatedItem. 
      // We cast to TextItem to access 'str' and 'hasEOL'.
      const textItem = item as TextItem;
      const str = textItem.str ?? "";

      current += str;

      if (textItem.hasEOL) {
        const line = current.trim();
        if (line) lines.push(line);
        current = "";
      }
    }

    if (current.trim()) {
      lines.push(current.trim());
    }

    return lines.join("\n");
  }
}