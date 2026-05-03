import { type SchemaTypeDefinition } from 'sanity'

import { categoryType } from './categoryType'
import { contactMessageType } from './contactMessageType'
import { customerType } from './customerType'
import { orderType } from './orderType'
import { productType } from './productType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [categoryType, contactMessageType, customerType, productType, orderType],
}
