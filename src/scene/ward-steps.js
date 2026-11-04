const sitting = {elder:'sitting', player:'lying', present:[], table:['milk','egg','bread'], held:null};
const awake = {...sitting, player:'sitting'};
const visiting = {...awake, table:['bread'], held:'egg', present:['aunt']};
export const WARD_STEPS = [
  ['wake', {...sitting, present:['doctor']}],
  ['premise-2', {...sitting, present:['doctor']}],
  ['premise-3', {...sitting, present:['doctor']}],
  ['premise-4', {...sitting, present:['doctor']}],
  ['doctor-zh', {...sitting, present:['doctor','nurse']}],
  ['nurse-reply', {...sitting, present:['doctor','nurse']}],
  ['ask-milk', awake],
  ['wrong-bread', {...awake, table:['milk','egg'], held:'bread'}],
  ['hand-milk', {...awake, table:['egg','bread'], held:'milk'}],
  ['ask-egg', {...awake, table:['egg','bread'], held:'milk'}],
  ['hand-egg', {...awake, table:['bread'], held:'egg'}],
  ['aunt-arrives', visiting],
  ['aunt-asks', visiting],
  ['reply', visiting],
  ['end', visiting],
];
