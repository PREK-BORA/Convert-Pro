export function createUpload(files,tool){const data=new FormData();data.append('tool',tool);for(const file of files)data.append('files',file);return data;}
