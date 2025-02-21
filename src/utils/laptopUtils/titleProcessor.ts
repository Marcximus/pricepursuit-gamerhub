
export const processTitle = (title: string): string => {
  if (!title) return '';
  
  // Extract brand name first with expanded patterns
  const brandPatterns = [
    /\b(Lenovo|HP|Dell|Apple|Acer|ASUS|Microsoft|Samsung|MSI|Razer|LG|Huawei|Dynabook|Toshiba|Gigabyte|Fujitsu|Panasonic|VAIO|Xiaomi|ThinkPad|IdeaPad|Pavilion|Inspiron|XPS|MacBook|Chromebook|ROG|Alienware|Predator|Swift|Aspire|Surface|Galaxy|GS|Blade|Gram|MateBook|LIFEBOOK|ToughBook|ProArt|Zenbook|Vivobook)\b/i,
  ];
  
  let brand = '';
  for (const pattern of brandPatterns) {
    const match = title.match(pattern);
    if (match) {
      brand = match[1];
      break;
    }
  }
  
  // Clean up the title and keep only essential model information
  let processed = title
    .replace(/^(New|Latest|2024|2023|Updated)\s*/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/with\s+.*$/i, '')
    .replace(/\b(Gaming|Business|Student)\s*(Laptop|Notebook)?\b/i, '')
    .replace(/\b(Free|Premium|Professional)\s+\w+(\s+\w+)?\b/i, '')
    .replace(/\b\d+GB\b/gi, '')
    .replace(/\b(DDR4|DDR5|SSD|HDD|PCIe|NVMe)\b/gi, '')
    .replace(/\b(Intel Core i[3579](-\d{4,5}[A-Z]*)?|AMD Ryzen [3579]|Intel Celeron|Intel Pentium|MediaTek|Apple M[12])\s*[\w-]*\b/gi, '')
    .replace(/\b(NVIDIA GeForce RTX \d{4}|GTX \d{3,4})\b/gi, '')
    .replace(/\b\d{2,4}x\d{2,4}\b/g, '')
    .replace(/\b\d+(\.\d+)?"?\s*(inch|display|screen)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
    
  processed = brand ? `${brand} ${processed}` : processed;
  return processed.length > 50 ? processed.substring(0, 47) + '...' : processed;
};
