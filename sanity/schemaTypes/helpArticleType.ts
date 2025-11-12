import {HelpCircleIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const helpArticleType = defineType({
  name: 'helpArticle',
  title: 'Help Article',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      description: 'Brief description for search and previews',
    }),
    defineField({
      name: 'category',
      type: 'string',
      options: {
        list: [
          {title: 'Getting Started', value: 'getting-started'},
          {title: 'Booking', value: 'booking'},
          {title: 'Pricing', value: 'pricing'},
          {title: 'Services', value: 'services'},
          {title: 'Documents', value: 'documents'},
          {title: 'Technical Support', value: 'technical'},
          {title: 'Account', value: 'account'},
          {title: 'Other', value: 'other'},
        ],
      },
    }),
    defineField({
      name: 'body',
      type: 'blockContent',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedArticles',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: {type: 'helpArticle'}})],
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      description: 'Show in featured articles section',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Display order (lower numbers appear first)',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      category: 'category',
      featured: 'featured',
    },
    prepare(selection) {
      const {title, category, featured} = selection
      return {
        title,
        subtitle: `${category || 'Uncategorized'}${featured ? ' • Featured' : ''}`,
      }
    },
  },
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
    {
      title: 'Published Date',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
})

