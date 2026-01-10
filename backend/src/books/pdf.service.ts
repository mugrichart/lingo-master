import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// For Node environments, you must point to the worker
import { PDFDocumentProxy, TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';

@Injectable()
export class PdfService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ){}
  
  async getPdf(url: string) {
    const key = `pdfUrl-${url}`
    let pdf = await this.cacheManager.get(key)
    if (pdf) {
      return pdf as PDFDocumentProxy
    } else {
      const res = await fetch(url);
      const buffer = new Uint8Array(await res.arrayBuffer());
  
      // In Node.js, pdfjs needs the workerSrc set or it might fail
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      pdf = await loadingTask.promise;
      await this.cacheManager.set(key, pdf, 600000)
      return pdf as PDFDocumentProxy
    }
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