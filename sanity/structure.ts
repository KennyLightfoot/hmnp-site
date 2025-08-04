import type {StructureResolver} from 'sanity/desk'

export const structure: StructureResolver = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // Filter out specific document types from the main list
      ...S.documentTypeListItems().filter(
        (item: any) => item.getId() && !['post', 'category', 'author'].includes(item.getId()!),
      ),
    ])
