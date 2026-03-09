/**
 * Type declarations for piexifjs (UMD / CommonJS module)
 * https://github.com/hMatoba/piexifjs
 */
declare module 'piexifjs' {
  interface IExif {
    '0th'?: Record<number, unknown>;
    'Exif'?: Record<number, unknown>;
    'GPS'?: Record<number, unknown>;
    '1st'?: Record<number, unknown>;
    thumbnail?: string | null;
  }

  interface Piexif {
    /** Load EXIF from a JPEG data-URL and return a structured object */
    load(jpegData: string): IExif;
    /** Serialise an EXIF object to a binary string */
    dump(exifObj: IExif): string;
    /** Insert EXIF bytes into a JPEG data-URL and return the updated data-URL */
    insert(exifBytes: string, jpegData: string): string;
    /** Remove existing EXIF from a JPEG data-URL */
    remove(jpegData: string): string;

    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
    InteropIFD: Record<string, number>;
    TagValues: Record<string, Record<string, number>>;
  }

  const piexif: Piexif;
  export default piexif;

  // Also export named for CommonJS-style usage
  export function load(jpegData: string): IExif;
  export function dump(exifObj: IExif): string;
  export function insert(exifBytes: string, jpegData: string): string;
  export function remove(jpegData: string): string;
  export const ImageIFD: Record<string, number>;
  export const ExifIFD: Record<string, number>;
  export const GPSIFD: Record<string, number>;
}
