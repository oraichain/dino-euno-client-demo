export enum MediaType {
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  JSON = 'JSON',
  TEXT = 'TEXT'
}

class ContentTypeClass {
  private contentTypes: string[]
  constructor(contentTypes: string[]) {
    this.contentTypes = contentTypes
  }
  public amI(type: string) {
    return this.contentTypes.some(contentType => contentType.includes(type))
  }

  static factory(contentTypes: string[]): ContentTypeClass {
    return new ContentTypeClass(contentTypes)
  }
}

const contentTypeClasses = {
  IMAGE: ContentTypeClass.factory([
    "image/gif",   
    "image/jpeg",
    "image/png",   
    "image/tiff",    
    "image/vnd.microsoft.icon",    
    "image/x-icon",   
    "image/vnd.djvu",  
    "image/svg+xml",
    "application/octet-stream",
  ]),
  AUDIO: ContentTypeClass.factory([
    "audio/mpeg",   
    "audio/x-ms-wma",   
    "audio/vnd.rn-realaudio",   
    "audio/x-wav",
  ]),
  TEXT: ContentTypeClass.factory([
    "text/css",   
    "text/csv",    
    "text/html",    
    "text/javascript",    
    "text/plain",
    "text/xml",
  ]),
  VIDEO: ContentTypeClass.factory([
    "video/mpeg",  
    "video/mp4",  
    "video/quicktime",    
    "video/x-ms-wmv",    
    "video/x-msvideo",    
    "video/x-flv",   
    "video/webm",   
  ]),
  JSON: ContentTypeClass.factory([
    "application/java-archive",
    "application/EDI-X12",
    "application/EDIFACT",  
    "application/javascript",
    "application/ogg",
    "application/pdf", 
    "application/xhtml+xml",   
    "application/x-shockwave-flash",    
    "application/json",
    "application/ld+json",  
    "application/xml",
    "application/zip", 
    "application/x-www-form-urlencoded",
  ]),
}


export const classifyMediaType = (type: string): MediaType => {
  if (contentTypeClasses.IMAGE.amI(type))return MediaType.IMAGE;
  if (contentTypeClasses.AUDIO.amI(type)) return MediaType.AUDIO;
  if (contentTypeClasses.TEXT.amI(type)) return MediaType.TEXT;
  if (contentTypeClasses.VIDEO.amI(type)) return MediaType.VIDEO;

  return MediaType.JSON
}