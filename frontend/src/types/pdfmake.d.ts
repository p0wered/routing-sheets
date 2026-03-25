declare module 'pdfmake/build/pdfmake' {
  interface PdfDoc {
    open(): void;
    download(filename: string): void;
  }
  const pdfMake: {
    vfs: unknown;
    createPdf(doc: unknown): PdfDoc;
  };
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: unknown;
  export default vfs;
}
