/**
 * Image Metadata Writer
 *
 * Embeds title, description, keywords, GPS and location data back into JPEG EXIF
 * using piexifjs, so downloaded photos carry the enriched metadata.
 */

import piexif from 'piexifjs';

export interface MetadataToEmbed {
  title?: string;
  description?: string;
  keywords?: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

/**
 * Convert a File to a base64 data-URL string (required by piexifjs)
 */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert decimal degrees to DMS rational array for piexifjs
 */
function decimalToDMSRational(decimal: number): Array<[number, number]> {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesFloat = (abs - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const secondsFloat = (minutesFloat - minutes) * 60;
  const seconds = Math.round(secondsFloat * 100);

  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ];
}

/**
 * Embed metadata into a JPEG file and return a Blob ready for download.
 * For non-JPEG files, returns the original file as-is (piexifjs only supports JPEG).
 */
export async function embedMetadataIntoJpeg(
  file: File,
  metadata: MetadataToEmbed
): Promise<Blob> {
  // piexifjs only handles JPEG
  const isJpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg');

  if (!isJpeg) {
    console.warn('piexifjs only supports JPEG; returning original file unchanged.');
    return file;
  }

  try {
    const dataURL = await fileToDataURL(file);

    // Load existing EXIF or start fresh
    let exifObj: piexif.IExif = {};
    try {
      exifObj = piexif.load(dataURL);
    } catch {
      // No existing EXIF is fine
      exifObj = { '0th': {}, 'Exif': {}, 'GPS': {}, '1st': {} };
    }

    if (!exifObj['0th']) exifObj['0th'] = {};
    if (!exifObj['GPS']) exifObj['GPS'] = {};

    const ifd0 = exifObj['0th'];
    const gpsIfd = exifObj['GPS'];

    // ---- Title → ImageDescription (0x010E) ----
    const fullTitle = [metadata.title, metadata.city, metadata.country]
      .filter(Boolean)
      .join(' - ');
    if (fullTitle) {
      ifd0[piexif.ImageIFD.ImageDescription] = fullTitle;
      // XPTitle (Windows) → stored as UTF-16LE byte array
      ifd0[piexif.ImageIFD.XPTitle] = stringToUtf16LEBytes(metadata.title ?? fullTitle);
    }

    // ---- Description → UserComment (Exif IFD) ----
    if (metadata.description) {
      if (!exifObj['Exif']) exifObj['Exif'] = {};
      // XPComment for Windows
      ifd0[piexif.ImageIFD.XPComment] = stringToUtf16LEBytes(metadata.description);
      // UserComment: ASCII charset header + bytes
      const comment = 'ASCII\x00\x00\x00' + metadata.description;
      exifObj['Exif'][piexif.ExifIFD.UserComment] = comment;
    }

    // ---- Keywords → XPKeywords ----
    if (metadata.keywords && metadata.keywords.length > 0) {
      const kwString = metadata.keywords.join('; ');
      ifd0[piexif.ImageIFD.XPKeywords] = stringToUtf16LEBytes(kwString);
    }

    // ---- GPS ----
    if (
      metadata.latitude !== undefined &&
      metadata.longitude !== undefined &&
      !isNaN(metadata.latitude) &&
      !isNaN(metadata.longitude)
    ) {
      gpsIfd[piexif.GPSIFD.GPSLatitudeRef] = metadata.latitude >= 0 ? 'N' : 'S';
      gpsIfd[piexif.GPSIFD.GPSLatitude] = decimalToDMSRational(metadata.latitude);
      gpsIfd[piexif.GPSIFD.GPSLongitudeRef] = metadata.longitude >= 0 ? 'E' : 'W';
      gpsIfd[piexif.GPSIFD.GPSLongitude] = decimalToDMSRational(metadata.longitude);
    }

    const exifBytes = piexif.dump(exifObj);
    const newDataURL = piexif.insert(exifBytes, dataURL);

    // Convert data-URL back to Blob
    const byteString = atob(newDataURL.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/jpeg' });
  } catch (err) {
    console.error('Error embedding metadata:', err);
    // Fallback: return original file
    return file;
  }
}

/**
 * Convert a JS string to a UTF-16 LE byte array (as numbers[])
 * required by piexifjs for Windows XP EXIF fields.
 */
function stringToUtf16LEBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code & 0xff);
    bytes.push((code >> 8) & 0xff);
  }
  // Null terminator
  bytes.push(0, 0);
  return bytes;
}
