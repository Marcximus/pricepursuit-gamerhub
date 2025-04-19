
/**
 * Add fallback handlers to img tags
 */
export const addImageFallbacks = (content: string): string => {
  return content.replace(
    /<img([^>]*)>/g, 
    '<img$1 onerror="this.onerror=null; this.src=\'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200\';">'
  );
};
