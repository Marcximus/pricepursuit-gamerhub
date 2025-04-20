
import { processJsonContent as parseJsonContent } from './processors/jsonContentProcessor';
import { processPlainText } from './processors/plainTextProcessor';
import { processJsonContent } from './processors/jsonProcessor';

export function processHowToContent(content: string, title: string): string {
  if (!content) return '';
  
  // First check if the content is already in JSON format
  const jsonContent = processJsonContent(content);
  if (jsonContent) {
    return parseJsonContent(jsonContent);
  }
  
  // If not JSON or parsing failed, process as plain text
  return processPlainText(content, title);
}
