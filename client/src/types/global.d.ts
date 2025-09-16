declare module 'xlsx' {
  const XLSX: any;
  export = XLSX;
}

declare module 'file-saver' {
  export function saveAs(data: Blob, filename: string): void;
}

