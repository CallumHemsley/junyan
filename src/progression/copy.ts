export type ProgressionCopy = {
  furniture: string; balance: string; invitation: string; visit: string; owned: string;
  money: (amount: number) => string;
  buy: (price: number) => string;
};

export const mandarinProgressionUi: ProgressionCopy = {
  furniture: "添置家具", balance: "可用的钱", invitation: "去楼里看看", visit: "去看看", owned: "已收下",
  money: amount => `${amount} 块`, buy: price => `买下 · ${price} 块`,
};

export const progressionUi = mandarinProgressionUi;
