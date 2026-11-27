export const config={port:Number(process.env.PORT)||4000,uploadLimit:100*1024*1024,maxFiles:20,frontendDist:new URL('../../../frontend/dist/',import.meta.url)};
