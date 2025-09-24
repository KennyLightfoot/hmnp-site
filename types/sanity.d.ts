// Temporary type declarations for Sanity
declare module '@sanity/icons' {
  export const UserIcon: React.ComponentType<any>;
  export const ImageIcon: React.ComponentType<any>;
  export const TagIcon: React.ComponentType<any>;
  export const DocumentTextIcon: React.ComponentType<any>;
}

declare module '@sanity/image-url' {
  export default function createImageUrlBuilder(config: any): any;
}

declare module '@sanity/image-url/lib/types/types' {
  export interface SanityImageSource {
    [key: string]: any;
  }
}

declare module 'next-sanity' {
  export function defineLive(config: any): any;
  export * from 'next-sanity/studio';
}
