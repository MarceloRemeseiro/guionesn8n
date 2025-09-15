import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function transformHeyGenUrlToMp4(heygenHtml: string): string | null {
  try {
    const hrefMatch = heygenHtml.match(/href="https:\/\/app\.heygen\.com\/share\/([^"]+)"/);
    const srcMatch = heygenHtml.match(/src="https:\/\/resource2\.heygen\.ai\/video\/([^"]+)\/gif\.gif"/);

    if (!hrefMatch || !srcMatch) {
      throw new Error('No se pudieron extraer los IDs necesarios del HTML de HeyGen');
    }

    const shareId = hrefMatch[1];
    const videoPath = srcMatch[1];

    return `https://resource2.heygen.ai/video/transcode/${shareId}/${videoPath}/1080x1920.mp4`;
  } catch (error) {
    console.error('Error transformando URL de HeyGen:', error);
    return null;
  }
}
