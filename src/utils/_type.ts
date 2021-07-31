export interface Tag {
  album?: string;
  artist?: string;
  genre?: string;
  image?: Image;
  title?: string;
  year?: string;
  trackNumber?: string;
  composer?: string;
}

export interface Image {
  mime: "image/png" | "image/jpeg";
  type: {
    id: number;
    name: string;
  };
  description: string;
  imageBuffer: Buffer;
}
