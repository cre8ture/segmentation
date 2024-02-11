const worker = new Worker('worker.js', { type: 'module' });
let imageSrc = ''
let buttonData = new Map();

// Reference the elements that we will need
const status = document.getElementById('status');
const fileUpload = document.getElementById('file-upload');
const imageContainer = document.getElementById('image-container');
const segmentationDiv = document.getElementById('segmentation-container');
const segmentationButton = document.getElementById('segmentation-button');
const segmentationRes = document.getElementById('segmentation');
const inputSegs = document.createElement('input');
const canvasHolder = document.getElementById('canvas-holder');
// inputSegs.setAttribute('type', 'text');
// inputSegs.setAttribute('id', 'input-segs');
// inputSegs.setAttribute('placeholder', 'Enter the the object in the image to segment');

// Create a new object detection pipeline
status.textContent = 'Loading model...';
status.textContent = 'Ready';
let segButtons = []

fileUpload.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();

    // Set up a callback when the file is loaded
    reader.onload = function (e2) {
        imageContainer.innerHTML = '';
        const image = document.createElement('img');
        image.src = e2.target.result;
        imageSrc = e2.target.result;
        imageContainer.appendChild(image);
        // detect(image);
        // worker.postMessage({ action: 'loadImage', file: file });
        worker.postMessage({ action: 'processImage',  imageSrc: image.src });
        status.textContent = 'Analysing Objects in Image...';
        console.log("segmentationDiv", segmentationDiv)
        segmentationDiv.style.display = 'block';



    };
    reader.readAsDataURL(file);
});

segmentationButton.addEventListener('click', function (e) {
  worker.postMessage({ action: 'segmentImage',  imageSrc: imageSrc });
  segmentationRes.textContent = 'Analysing Segmentation...';
})

worker.onmessage = function(e) {
  if (e.data.action === 'modelLoaded') {
    console.log("inage model is loaded")
  }
};

worker.onmessage = function(e) {
  if (e.data.action === 'detectionComplete') {
    const results = e.data.results;
    status.textContent = '';
    results.forEach(renderBox);
  }
  if (e.data.action === 'segmentationComplete') {
    const results = e.data.results;
    segmentationRes.appendChild(createTable(results));

    // Iterate through the buttons and add an event listener to each of them
    let segButtons = Array.from(segmentationRes.getElementsByClassName('seg-label-button'));
    segButtons.forEach((button, index) => {
      if (button.id.startsWith('segment_')) {
        // Store the data in the Map
        buttonData.set(button, results[index]);

        button.addEventListener('click', async function() {
          console.log('Button ' + index + ' clicked', button);
          // Retrieve the data from the Map
          let mask = buttonData.get(button).mask;
          let canvas = await applyMask(mask, imageSrc);
          console.log("canvas", canvas)
          canvasHolder.appendChild(canvas);
          downloadImage(canvas, 'segmented.png');
          console.log(buttonData.get(button));
          // Add your event handling code here
        });
      }
    });
  }
};


// Render a bounding box and label on the image
function renderBox({ box, label }) {
  const { xmax, xmin, ymax, ymin } = box;

  // Generate a random color for the box
  const color = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, 0);

  // Draw the box
  const boxElement = document.createElement('div');
  boxElement.className = 'bounding-box';
  Object.assign(boxElement.style, {
      borderColor: color,
      left: 100 * xmin + '%',
      top: 100 * ymin + '%',
      width: 100 * (xmax - xmin) + '%',
      height: 100 * (ymax - ymin) + '%',
  })

  // Draw label
  const labelElement = document.createElement('span');
  labelElement.textContent = label;
  labelElement.className = 'bounding-box-label';
  labelElement.style.backgroundColor = color;

  boxElement.appendChild(labelElement);
  imageContainer.appendChild(boxElement);
}
