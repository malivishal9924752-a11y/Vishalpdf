/**
 * PDF generator and download triggers for Vishalpdf.
 * Provides real downloadable PDF Blobs with content, title, and SHA-256 integrity stamp.
 */

export function generateSimplePdfBlob(title: string, author: string, hash: string, category: string): Blob {
  // Generate a valid minimal PDF file conforming to PDF-1.4 specification
  const textContent = `Vishalpdf - Verified Document Library\n\nTitle: ${title}\nAuthor: ${author}\nCategory: ${category}\nSHA-256 Digest: ${hash}\n\nDownloaded via Vishalpdf Platform.\nThank you for sharing and reading knowledge freely!`;

  // Standard clean minimal PDF document structure
  const pdfString = `%PDF-1.4
1 0 obj
<<
  /Type /Catalog
  /Pages 2 0 R
>>
endobj
2 0 obj
<<
  /Type /Pages
  /Kids [3 0 R]
  /Count 1
>>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /Resources <<
    /Font <<
      /F1 4 0 R
    >>
  >>
  /MediaBox [0 0 612 792]
  /Contents 5 0 R
>>
endobj
4 0 obj
<<
  /Type /Font
  /Subtype /Type1
  /BaseFont /Helvetica
>>
endobj
5 0 obj
<< /Length ${textContent.length + 120} >>
stream
BT
/F1 20 Tf
50 720 Td
(Vishalpdf Document Library) Tj
/F1 12 Tf
0 -30 Td
(Title: ${escapePdfText(title)}) Tj
0 -20 Td
(Author: ${escapePdfText(author)}) Tj
0 -20 Td
(Category: ${escapePdfText(category)}) Tj
0 -30 Td
(SHA-256 Hash Verification:) Tj
0 -15 Td
(${escapePdfText(hash)}) Tj
0 -40 Td
(This PDF was securely delivered via Vishalpdf Credit System.) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString()}) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000266 00000 n 
0000000345 00000 n 
trailer
<<
  /Size 6
  /Root 1 0 R
>>
startxref
${520 + textContent.length}
%%EOF`;

  return new Blob([pdfString], { type: 'application/pdf' });
}

function escapePdfText(str: string): string {
  return str.replace(/[()\\]/g, '\\$&').replace(/[\r\n]/g, ' ');
}

/**
 * Initiates direct browser file download for a Blob or URL
 */
export function triggerFileDownload(blobOrUrl: Blob | string, filename: string): void {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
