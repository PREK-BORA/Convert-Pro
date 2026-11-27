export const supportedFormats = {
  pdf: ['pdf'],
  image: ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'svg'],
  document: ['docx', 'txt', 'html'],
  spreadsheet: ['csv', 'xlsx'],
  presentation: ['pptx'],
  video: ['mp4', 'avi', 'mov', 'webm', 'mkv'],
  audio: ['mp3', 'wav', 'aac', 'ogg', 'm4a'],
  archive: ['zip', 'tar']
};

export const maxUploadBytes = 100 * 1024 * 1024; // 100 MB
export const maxFilesPerBatch = 20;
