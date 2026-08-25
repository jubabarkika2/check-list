/**
 * Compresses an image file or DataURL to ensure fast uploads, snappy UI, and safe localStorage sizing.
 */
export async function compressImage(
  source: File | string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(typeof source === 'string' ? source : '');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Watermark with timestamp
      const dateStr = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      const padding = 8;
      const fontSize = Math.max(12, Math.round(width * 0.028));
      ctx.font = `600 ${fontSize}px sans-serif`;
      const text = `🕒 ${dateStr} • Comprovante`;
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const textHeight = fontSize + 4;

      ctx.fillRect(
        width - textWidth - padding * 2 - 12,
        height - textHeight - padding * 2 - 12,
        textWidth + padding * 2,
        textHeight + padding
      );

      ctx.fillStyle = '#ffffff';
      ctx.fillText(
        text,
        width - textWidth - padding - 12,
        height - padding * 1.5 - 12
      );
      ctx.restore();

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      reject(err);
    };

    if (typeof source === 'string') {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(source);
    }
  });
}
