// Centralized document registry - scalable & maintainable
const DOCUMENT_REGISTRY = {
  'STA 320 lecture 1-2': {
    url: 'assets/documents/STA 320 lecture 1-2.pdf',
    title: 'STA 320: Lecture 1-2 Notes',
    type: 'pdf',
    allowPrint: true,
    allowDownload: false
  }
  // Add more documents here without changing component code
};

export async function loadDocumentMetadata(fileId) {
  const doc = DOCUMENT_REGISTRY[fileId];
  if (!doc) throw new Error(`Document "${fileId}" not found`);
  return doc;
}

export async function renderPdfViewer(containerId, pdfUrl, options = {}) {
  const container = document.getElementById(containerId);
  
  // Option A: Simple iframe (quick, compatible) [[5]]
  if (options.useSimpleViewer) {
    container.innerHTML = `<iframe src="${pdfUrl}" class="pdf-frame"></iframe>`;
    return;
  }
  
  // Option B: Adobe PDF Embed API (rich features, analytics) [[2]][[4]]
  if (options.useAdobeViewer) {
    return new Promise((resolve) => {
      // Load Adobe SDK dynamically
      const script = document.createElement('script');
      script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
      script.onload = () => {
        document.addEventListener('adobe_dc_view_sdk.ready', function init() {
          document.removeEventListener('adobe_dc_view_sdk.ready', init);
          
          const adobeDCView = new AdobeDC.View({
            clientId: import.meta.env.VITE_ADOBE_CLIENT_ID,
            divId: containerId
          });
          
          adobeDCView.previewFile({
            content: { location: { url: pdfUrl }},
            metaData: { fileName: pdfUrl.split('/').pop() }
          }, {
            embedMode: options.embedMode || 'FULL_WINDOW',
            showDownloadPDF: options.showDownload ?? false,
            showPrintPDF: options.showPrint ?? true,
            showAnnotationTools: options.allowAnnotations ?? false
          });
          resolve();
        });
      };
      document.head.appendChild(script);
    });
  }
  
  // Option C: PDF.js (open-source, full control) [[5]]
  // Implementation available at: https://mozilla.github.io/pdf.js/
  container.innerHTML = `<canvas id="pdf-canvas"></canvas>`;
  // ... PDF.js rendering logic
}