
/**
 * Improves paragraph spacing in blog content
 */
export const improveContentSpacing = (content: string): string => {
  let improvedContent = content;
  
  improvedContent = improvedContent.replace(
    /(<p>[📱🌟💻✅🚀💡✨🔥👉][^<]*?<\/p>)(<p>)/g, 
    '$1\n<div class="my-6"></div>$2'
  );
  
  improvedContent = improvedContent.replace(
    /(<\/p>)(<p>)/g,
    '$1\n<div class="my-4"></div>$2'
  );
  
  improvedContent = improvedContent.replace(
    /(<\/p>)(<ul)/g,
    '$1\n<div class="my-4"></div>$2'
  );
  
  improvedContent = improvedContent.replace(
    /(<\/ul>)(\s*)(<p>)/g,
    '$1\n<div class="my-6"></div>$3'
  );
  
  improvedContent = improvedContent.replace(
    /<p>(✅[^<]*?)<\/p>/g,
    '<p class="flex items-start mb-2"><span class="mr-2 flex-shrink-0">✅</span><span>$1</span></p>'
  );
  
  return improvedContent;
};
