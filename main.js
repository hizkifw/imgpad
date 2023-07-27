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

function computeOffset(originalWidth, originalHeight, newWidth, newHeight) {
  // Calculate the offset for the horizontal and vertical axis
  let offsetX = (newWidth - originalWidth) / 2;
  let offsetY = (newHeight - originalHeight) / 2;

  return [offsetX, offsetY].map(Math.round);
}

async function generate() {
  const elFile = document.querySelector("#infile");
  const elAspX = document.querySelector("#aspectx");
  const elAspY = document.querySelector("#aspecty");
  const elColor = document.querySelector("#bgcolor");
  const elCanvas = document.querySelector("#canvas");

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
    image.width,
    image.height,
  );
  const [offsetX, offsetY] = computeOffset(
    image.width,
    image.height,
    targetWidth,
    targetHeight,
  );

  // Set up canvas
  elCanvas.width = targetWidth;
  elCanvas.height = targetHeight;

  // Draw the image
  const ctx = elCanvas.getContext("2d");
  ctx.fillStyle = elColor.value;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(image, offsetX, offsetY);
}

function save() {
  const elCanvas = document.querySelector("#canvas");
  const elFile = document.querySelector("#infile");

  const link = document.createElement('a');
  link.download = 'pad-' + elFile.files[0].name;
  link.href = elCanvas.toDataURL(elFile.files[0].type);
  link.click();
}
