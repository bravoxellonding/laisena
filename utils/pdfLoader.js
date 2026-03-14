// Centralized document registry - scalable & maintainable
const DOCUMENT_REGISTRY = {
  'F-Distribution-Table': {
    url: 'assets/F-Distribution-Table.pdf',
    title: 'F-Distribution Table',
    type: 'pdf',
    allowPrint: true,
    allowDownload: false
  },
  'STA 320 lecture 1-2': {
    url: 'assets/STA 320 lecture 1-2.pdf',
    title: 'STA 320: Lecture 1-2 Notes',
    type: 'pdf',
    allowPrint: true,
    allowDownload: false
  },
  'Bravo test Resume':{
    url: 'assets/Bravinw_cv.pdf',
    title: 'proffessional cv',
    type: 'pdf',
    allowPrint: true,
    allowDownload: false
  }
};

export function getDocument(fileId) {
  const doc = DOCUMENT_REGISTRY[fileId];
  if (!doc) throw new Error(`Document "${fileId}" not found`);
  return doc;
}

export function getAllDocuments() {
  return DOCUMENT_REGISTRY;
}

/**
 * Renders a PDF into a container using PDF.js
 * @param {string} containerId  - ID of the DOM element to render into
 * @param {string} pdfUrl       - URL of the PDF file
 * @param {object} options      - { onPageChange, onTotalPages }
 * @returns {object}            - controller with { goTo, nextPage, prevPage, destroy }
 */
export async function renderPdfViewer(containerId, pdfUrl, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error(`Container #${containerId} not found`);

  // Ensure PDF.js is loaded
  await ensurePdfJs();

  const pdfjsLib = window.pdfjsLib;
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  container.innerHTML = '';
  container.style.overflowY = 'auto';

  let pdfDoc = null;
  let currentPage = 1;
  let totalPages = 0;
  let rendering = false;
  let pendingPage = null;

  // Load PDF
  const loadingTask = pdfjsLib.getDocument(pdfUrl);
  pdfDoc = await loadingTask.promise;
  totalPages = pdfDoc.numPages;

  if (options.onTotalPages) options.onTotalPages(totalPages);

  async function renderPage(num) {
    if (rendering) { pendingPage = num; return; }
    rendering = true;

    const page = await pdfDoc.getPage(num);

    // Responsive scale: fit to container width
    const containerWidth = container.clientWidth || 800;
    const viewport = page.getViewport({ scale: 1 });
    const scale = (containerWidth - 32) / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    // Reuse or create canvas
    let canvas = container.querySelector(`canvas[data-page="${num}"]`);
    if (!canvas) {
      container.innerHTML = '';
      canvas = document.createElement('canvas');
      canvas.setAttribute('data-page', num);
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
      canvas.style.borderRadius = '4px';
      container.appendChild(canvas);
    }

    canvas.height = scaledViewport.height;
    canvas.width = scaledViewport.width;

    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: scaledViewport }).promise;

    currentPage = num;
    rendering = false;

    if (options.onPageChange) options.onPageChange(currentPage, totalPages);

    if (pendingPage !== null) {
      const next = pendingPage;
      pendingPage = null;
      renderPage(next);
    }
  }

  await renderPage(1);

  return {
    goTo: (n) => {
      const p = Math.max(1, Math.min(n, totalPages));
      renderPage(p);
    },
    nextPage: () => {
      if (currentPage < totalPages) renderPage(currentPage + 1);
    },
    prevPage: () => {
      if (currentPage > 1) renderPage(currentPage - 1);
    },
    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
    destroy: () => {
      if (pdfDoc) pdfDoc.destroy();
      container.innerHTML = '';
    }
  };
}

function ensurePdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) return resolve();
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load PDF.js'));
    document.head.appendChild(script);
  });
}