async function applyMask(mask, imageSrc) {
  // Convert the one-dimensional mask data to two-dimensional
  let maskDataArray = new Uint8ClampedArray(mask.width * mask.height * 4);
  for (let i = 0; i < mask.data.length; i++) {
    if (mask.data[i] === 255) { // If the mask pixel is white (belongs to the cat)
      maskDataArray[i * 4] = maskDataArray[i * 4 + 1] = maskDataArray[i * 4 + 2] = 255; // Set the mask pixel to white
      maskDataArray[i * 4 + 3] = 255; // Full alpha
    } else { // If the mask pixel is black (does not belong to the cat)
      maskDataArray[i * 4] = maskDataArray[i * 4 + 1] = maskDataArray[i * 4 + 2] = 0; // Set the mask pixel to black
      maskDataArray[i * 4 + 3] = 255; // Full alpha
    }
  }

  // Create a new ImageData object
  let maskData = new ImageData(maskDataArray, mask.width, mask.height);

  // Create a new canvas
  let canvas = document.createElement('canvas');
  canvas.width = mask.width;
  canvas.height = mask.height;

  // Get the context of the canvas
  let ctx = canvas.getContext('2d', {willReadFrequently : true});

  // Create a new Image object
  let img = new Image();
  img.src = imageSrc;

  // Wait for the image to load
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  // Draw the image onto the canvas
  ctx.drawImage(img, 0, 0, mask.width, mask.height);

  // Get the image data from the canvas
  let originalImageData = ctx.getImageData(0, 0, mask.width, mask.height);

  // Put the mask data onto the canvas
  ctx.putImageData(maskData, 0, 0);

  // Get the image data for the segmented object
  let segmentedData = ctx.getImageData(0, 0, mask.width, mask.height);

  // Replace the pixels in the original image with the pixels from the segmented object
  for (let i = 0; i < originalImageData.data.length; i += 4) {
    if (segmentedData.data[i] === 255) { // If the mask pixel is white
      originalImageData.data[i] = originalImageData.data[i + 1] = originalImageData.data[i + 2] = 0; // Set the original image pixel to black
    }
  }

  // Redraw the original image
  ctx.putImageData(originalImageData, 0, 0);

  return canvas;
}

- function downloadImage(canvas, filename) {
    // Create a new anchor element
    let link = document.createElement('a');
  
    // Set the href of the link to the data URL of the canvas
    link.href = canvas.toDataURL();
  
    // Set the download attribute of the link
    link.download = filename || 'image.png';
  
    // Trigger the download
    link.click();
  }