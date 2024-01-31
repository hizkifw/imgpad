function computeDimensions(targetRatio, originalWidth, originalHeight) {
  const originalRatio = originalWidth / originalHeight;
  let newWidth, newHeight;

  if (originalRatio > targetRatio) {
    newWidth = originalWidth;
    newHeight = newWidth / targetRatio;
  } else if (originalRatio < targetRatio) {
    newHeight = originalHeight;
    newWidth = newHeight * targetRatio;
  } else {
    newWidth = originalWidth;
    newHeight = originalHeight;
  }

  return [newWidth, newHeight].map(Math.round);
}

function computeOffset(originalWidth, originalHeight, newWidth, newHeight, padding) {
  // Calculate the offset for the horizontal and vertical axis
  let offsetX = padding + ((newWidth - originalWidth) / 2);
  let offsetY = padding + ((newHeight - originalHeight) / 2);

  return [offsetX, offsetY].map(Math.round);
}

async function generate() {
  const elFile = document.querySelector("#infile");
  const elAspX = document.querySelector("#aspectx");
  const elAspY = document.querySelector("#aspecty");
  const elColor = document.querySelector("#bgcolor");
  const elBlur = document.querySelector("#bluramount");
  const elPadding = document.querySelector("#padding");
  const elCanvas = document.querySelector("#canvas");

  const blurAmount = Number(elBlur.value);
  const padAmount = Number(elPadding.value);

  // Get image
  const image = await new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
      URL.revokeObjectURL(image.src);
    };
    image.src = URL.createObjectURL(elFile.files[0]);
  });

  // Compute canvas size
  const [targetWidth, targetHeight] = computeDimensions(
    Number(elAspX.value) / Number(elAspY.value),
    image.width + (2 * padAmount),
    image.height + (2 * padAmount),
  );
  const [offsetX, offsetY] = computeOffset(
    image.width + (2 * padAmount),
    image.height + (2 * padAmount),
    targetWidth,
    targetHeight,
    padAmount,
  );

  // Set up canvas
  elCanvas.width = targetWidth;
  elCanvas.height = targetHeight;

  // Draw the image
  const ctx = elCanvas.getContext("2d");
  ctx.fillStyle = elColor.value;

  if (blurAmount <= 0) {
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // Draw background with blur
    ctx.filter = `blur(${blurAmount}px)`;
    drawImageProp(ctx, image, 0, 0, targetWidth, targetHeight);
    ctx.filter = 'none';
  }

  ctx.shadowBlur = blurAmount / 2;
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.drawImage(image, offsetX, offsetY);
  ctx.shadowBlur = 0;
}

function save() {
  const elCanvas = document.querySelector("#canvas");
  const elFile = document.querySelector("#infile");

  const link = document.createElement('a');
  link.download = 'pad-' + elFile.files[0].name;
  link.href = elCanvas.toDataURL(elFile.files[0].type);
  link.click();
}



/**
 * By Ken Fyrstenberg Nilsen
 *
 * drawImageProp(context, image [, x, y, width, height [,offsetX, offsetY]])
 *
 * If image and context are only arguments rectangle will equal canvas
*/
function drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

  if (arguments.length === 2) {
    x = y = 0;
    w = ctx.canvas.width;
    h = ctx.canvas.height;
  }

  // default offset is center
  offsetX = typeof offsetX === "number" ? offsetX : 0.5;
  offsetY = typeof offsetY === "number" ? offsetY : 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  var iw = img.width,
    ih = img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r,   // new prop. width
    nh = ih * r,   // new prop. height
    cx, cy, cw, ch, ar = 1;

  // decide which gap to fill    
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}
