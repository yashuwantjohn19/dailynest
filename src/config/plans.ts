export const PLANS = [
  { id: 'basic', name: 'Basic', quantity: 10, price: 99, description: 'A tidy batch for one or two people.' },
  { id: 'standard', name: 'Standard', quantity: 20, price: 179, description: 'The everyday family table.' },
  { id: 'family', name: 'Family', quantity: 32, price: 259, description: 'A generous batch for larger homes.' },
] as const
export const PRICING_NOTE = 'Launch pricing. Final taxes and delivery fees will be confirmed before payment.'
export function previewPriceForQuantity(quantity: number) { return PLANS.find((plan) => plan.quantity === quantity)?.price }
