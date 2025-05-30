import Jimp from 'jimp';
import fs from 'fs';
import path from 'path';

/**
 * Tambahkan teks ke dalam gambar dan kembalikan sebagai Buffer.
 * @param {Buffer|string} input - Path gambar atau buffer.
 * @param {string} text - Teks yang mau ditambahkan.
 * @param {object} options - { top, left, right, bottom, font, alignx, aligny }
 * @returns {Promise<Buffer>} - Buffer gambar hasil edit.
 */
async function addTextToImage(input, text, options = {}) {
  const image = await Jimp.read(input);
  const {
    top,
    left,
    right,
    bottom,
    font = Jimp.FONT_SANS_32_WHITE,
    alignx = 'center', // left, center, right
    aligny = 'middle', // top, middle, bottom
  } = options;

  const loadedFont =
    typeof font === 'string' && fs.existsSync(font)
      ? await Jimp.loadFont(font)
      : await Jimp.loadFont(font);

  const imageWidth = image.bitmap.width;
  const imageHeight = image.bitmap.height;

  const marginLeft = typeof left === 'number' ? left : (typeof right === 'number' ? 0 : 0);
  const marginTop = typeof top === 'number' ? top : (typeof bottom === 'number' ? 0 : 0);

  const areaWidth = typeof left === 'number' && typeof right === 'number'
    ? imageWidth - left - right
    : imageWidth;

  const areaHeight = typeof top === 'number' && typeof bottom === 'number'
    ? imageHeight - top - bottom
    : imageHeight;

  image.print(
    loadedFont,
    marginLeft,
    marginTop,
    {
      text,
      alignmentX:
        alignx === 'left'
          ? Jimp.HORIZONTAL_ALIGN_LEFT
          : alignx === 'right'
          ? Jimp.HORIZONTAL_ALIGN_RIGHT
          : Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY:
        aligny === 'top'
          ? Jimp.VERTICAL_ALIGN_TOP
          : aligny === 'bottom'
          ? Jimp.VERTICAL_ALIGN_BOTTOM
          : Jimp.VERTICAL_ALIGN_MIDDLE,
    },
    areaWidth,
    areaHeight
  );

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

export { addTextToImage };
