
import { getRamValue, getStorageValue, getScreenSizeValue } from './valueParser';

export const normalizeRam = (ram: string): string => {
  const gbValue = getRamValue(ram);
  if (gbValue === 0) return ram;
  return `${gbValue} GB`;
};

export const normalizeStorage = (storage: string): string => {
  const gbValue = getStorageValue(storage);
  if (gbValue < 32) {
    return '';
  }
  return `${gbValue} GB`;
};

export const normalizeScreenSize = (size: string): string => {
  const match = size.match(/(\d+\.?\d*)/);
  if (match) {
    return `${match[1]}"`;
  }
  return size;
};

export const normalizeGraphics = (graphics: string): string => {
  const nvidia = graphics.match(/NVIDIA\s+(RTX|GTX)\s*(\d+)/i);
  if (nvidia) {
    return `NVIDIA ${nvidia[1]} ${nvidia[2].charAt(0)}XXX`;
  }
  const amd = graphics.match(/AMD\s+Radeon/i);
  if (amd) {
    return "AMD Radeon";
  }
  const intel = graphics.match(/Intel\s+(Iris|UHD|HD)/i);
  if (intel) {
    return `Intel ${intel[1]} Graphics`;
  }
  return graphics;
};

export const normalizeProcessor = (processor: string): string => {
  const intel = processor.match(/Intel\s+Core\s+(i\d)-(\d{4,5})/i);
  if (intel) {
    return `Intel Core ${intel[1]} ${intel[2].charAt(0)}th Gen`;
  }
  const amd = processor.match(/AMD\s+Ryzen\s+(\d)\s+(\d{4})/i);
  if (amd) {
    return `AMD Ryzen ${amd[1]} ${amd[2].charAt(0)}XXX`;
  }
  return processor;
};
