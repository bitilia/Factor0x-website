// Shared in-memory registry so any rendered invoice (offer card or table
// row) can be looked up by id when its "View Details" button is clicked —
// regardless of which module rendered it.
const deals = new Map();

export function registerDeal(deal) {
  if (!deal?.id) return;
  deals.set(deal.id, deal);
}

export function getDeal(id) {
  return deals.get(id);
}
