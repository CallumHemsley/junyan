export const copy = {
  title: '共用书房', briefs: '摆放安排', first: '第一处窗边', second: '第二处窗边', locked: '先摆好第一处',
  table: '选择桌子', chair: '选择椅子', rotate: '转一下', place: '放这里', cancel: '取消摆放',
  check: '这样可以', restart: '重新摆放', floor: '地板，点一下预览，回车放下',
  instructions: '再听摆放安排', progress: '已经摆好',
  cell: (x: number, y: number, path: boolean, fixture: boolean, occupant?: string) => `第${y + 1}行第${x + 1}格${path ? '，留出路' : fixture ? '，书架' : occupant ? `，${occupant}` : ''}`,
};
