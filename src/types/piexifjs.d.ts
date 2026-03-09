/**
 * Minimal type declarations for piexifjs
 * https://github.com/hMatoba/piexifjs
 */
declare module 'piexifjs' {
  export interface IExif {
    '0th'?: Record<number, unknown>;
    'Exif'?: Record<number, unknown>;
    'GPS'?: Record<number, unknown>;
    '1st'?: Record<number, unknown>;
    thumbnail?: string | null;
  }

  /** Load EXIF from a JPEG data-URL (e.g. "data:image/jpeg;base64,...") */
  export function load(jpegData: string): IExif;

  /** Serialise an EXIF object to a binary string */
  export function dump(exifObj: IExif): string;

  /** Insert EXIF bytes into a JPEG data-URL and return the new data-URL */
  export function insert(exifBytes: string, jpegData: string): string;

  /** Remove existing EXIF from a JPEG data-URL */
  export function remove(jpegData: string): string;

  // IFD0 / IFD1 tag numbers
  export const ImageIFD: {
    ImageDescription: number;
    XPTitle: number;
    XPComment: number;
    XPKeywords: number;
    [key: string]: number;
  };

  export const ExifIFD: {
    UserComment: number;
    [key: string]: number;
  };

  export const GPSIFD: {
    GPSLatitudeRef: number;
    GPSLatitude: number;
    GPSLongitudeRef: number;
    GPSLongitude: number;
    [key: string]: number;
  };

  export const InteropIFD: Record<string, number>;
  export const TagValues: Record<string, Record<string, number>>;
}
