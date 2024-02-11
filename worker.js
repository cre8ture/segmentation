import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0';
// const output = await segmenter(url);
// Since we will download the model from the Hugging Face Hub, we can skip the local model check
env.allowLocalModels = false;
// worker.js
(async function() {
    const detector = await pipeline('object-detection', 'Xenova/detr-resnet-50');
    const segmenter = await pipeline('image-segmentation', 'Xenova/detr-resnet-50-panoptic');
  
    self.onmessage = async function(e) {
      if (e.data.action === 'processImage') {
        console.log('worker.js: processImage')
        const results = await detector(e.data.imageSrc, {
          threshold: 0.5,
          percentage: true,
        });
        self.postMessage({ action: 'detectionComplete', results: results });
      };
  
      if (e.data.action === "segmentImage") {
        console.log('worker.js: segmentImage')
        const output = await segmenter(e.data.imageSrc);
        console.log("i am output", output)
        self.postMessage({ action: 'segmentationComplete', results: output });
      }
    };
  
    self.postMessage({ action: 'modelLoaded' }); 
  })();