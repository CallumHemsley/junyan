import type { GiftId, LocationId } from './contracts';

export const mandarinNeighbourhoodUi = {
  locations: { restaurant: '早安小馆', apartment: '家', cats: '院子', repairs: '修理间', garden: '屋顶花园', 'reading-room': '共用书房' } satisfies Record<LocationId, string>,
  navigation: '楼里', gifts: '邻居的小礼物', takeHome: '带回家',
  giftNames: {'repairs.stool': '凳子', 'garden.planter': '盆栽', 'cats.cushion': '猫靠垫'} satisfies Record<GiftId, string>,
  claim: (name: string) => `收下${name}`,
};

export const neighbourhoodUi = mandarinNeighbourhoodUi;
