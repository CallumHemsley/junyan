import {characterFigure, characterTray, COLORS} from './renderer.js';

export function portraitScene(figure = {characterFigure, characterTray, COLORS}) {
return {
bake() {},
draw(api, palette, yaw, pose, foods, withoutEyes = false) {
  const {pix,zb,ground,groundZ,rgb,box,shadeEdges,dynamicAdd} = api;
  pix.fill(rgb(235,225,207)); zb.fill(-1e9); groundZ.fill(-1e9); ground.fill(0);
  const rig=figure.characterFigure(0,0,yaw,pose,palette,(start,end,startRadius,endRadius,color)=>{
    const eye=[.038,.065,.04].some(radius=>Math.abs(startRadius/(pose.scale||1)-radius)<1e-10)&&[figure.COLORS.cream,figure.COLORS.ink].includes(color(start[2]));
    if(!withoutEyes||!eye) dynamicAdd(start,end,startRadius,endRadius,color);
  });
  if(pose.carry) figure.characterTray(rig,foods,(start,end,color,transform)=>box(...start,...end,color,0,transform));
  shadeEdges();
},
};
}
