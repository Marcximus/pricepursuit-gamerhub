
import { processTitle } from './titleProcessor';
import { processProcessor, processRam, processStorage } from './specsProcessor';
import { processGraphics } from './graphicsProcessor';
import { processScreenSize, processWeight, processBatteryLife } from './physicalSpecsProcessor';
import type { Product } from "@/types/product";

export const processLaptopData = (laptop: any): Product => {
  console.log('Processing laptop:', laptop.title);
  
  // Parse review_data if it exists and is a string
  let parsedReviewData = laptop.review_data;
  if (typeof laptop.review_data === 'string') {
    try {
      parsedReviewData = JSON.parse(laptop.review_data);
    } catch (error) {
      console.error('Error parsing review data:', error);
      parsedReviewData = undefined;
    }
  } else if (laptop.review_data === null) {
    parsedReviewData = undefined;
  }

  const processed = {
    ...laptop,
    title: processTitle(laptop.title || ''),
    processor: processProcessor(laptop.processor, laptop.title || ''),
    ram: processRam(laptop.ram, laptop.title || ''),
    storage: processStorage(laptop.storage, laptop.title || ''),
    graphics: processGraphics(laptop.graphics, laptop.title || ''),
    screen_size: processScreenSize(laptop.screen_size, laptop.title || ''),
    weight: processWeight(laptop.weight, laptop.title || ''),
    battery_life: processBatteryLife(laptop.battery_life, laptop.title || ''),
    review_data: parsedReviewData
  };

  console.log('Processed laptop:', processed);
  return processed;
};

export * from './titleProcessor';
export * from './specsProcessor';
export * from './graphicsProcessor';
export * from './physicalSpecsProcessor';
