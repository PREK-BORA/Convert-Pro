export function getSafeDownloadName(name){return String(name||'converted-file').replace(/[\\/\\0-\\x1f]/g,'_').slice(0,180);}
