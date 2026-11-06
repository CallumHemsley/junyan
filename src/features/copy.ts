import type { ItemId } from './apartment/rules';

export const mandarinFeatureUi = {
  apartment: {
    title: '家', resident: '林姐', undo: '撤回', editor: '摆放家具', rotate: '转一下', place: '放这里', store: '收起来', cancel: '取消', grid: '选格子', floor: '地板', path: '路',
    replay: '再听', replayLabel: '再听一遍', starter: '桌子 · 椅子 · 地毯 · 靠垫', accept: '收下', preview: '先看看', inventory: '家具', placed: '屋里', stored: '收着', options: '换个样子',
    cushionColour: '靠垫颜色', cushion: '靠垫', colours: {blue: '蓝色', cream: '米色'}, rugSize: '地毯大小', rug: '地毯', sizes: {small: '小', large: '大'}, gift: '今日小礼物',
    scene: '窗边的小家，床和家具，林姐站在门前', floorHelp: '地板，点一下预览，方向键移动，回车放下', window: '窗户', door: '门',
    cell: (x: number, y: number, protectedCell: boolean, occupant?: string) => `第${y + 1}行第${x + 1}格${protectedCell ? '，留出路' : occupant ? `，${occupant}` : ''}`,
    items: {bed: '床', table: '桌子', chair: '椅子', rug: '地毯', cushion: '靠垫', 'repairs.stool': '凳子', 'garden.planter': '盆栽', 'cats.cushion': '猫靠垫', vase: '花瓶', basket: '篮子', lamp: '灯', 'blue-vase': '蓝色花瓶', 'large-basket': '大篮子', 'small-lamp': '小灯'} satisfies Record<ItemId, string>,
  },
  repairs: {
    title: '修理间', jobs: '修理物件', jobNames: {lamp: '台灯', toy: '玩具'}, replay: '再听', operations: '物件操作',
    tighten: '拧紧', loosen: '转松', open: '打开', close: '盖上', connect: '接上', disconnect: '拔下', replaceBattery: '换电池', replaceOldBattery: '放回旧电池',
    test: '试试', powerOff: '关掉', return: '放回', reset: '重新来', practice: '再修一次',
  },
  sentenceEnd: '。', close: '收起', dismiss: '关闭', word: '词语',
};

export const featureUi = mandarinFeatureUi;
