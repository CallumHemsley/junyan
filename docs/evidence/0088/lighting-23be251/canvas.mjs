/** The host owns projection, clipping, canvas resolution and the frame loop. */
export function drawAtmosphereLayer(ctx, commands, layer, project) {
    ctx.save();
    let drawn = 0;
    for (const command of commands) {
        if (command.layer !== layer)
            continue;
        ctx.globalAlpha = command.opacity;
        ctx.fillStyle = `rgb(${command.color.join(',')})`;
        ctx.beginPath();
        command.points.forEach((point, i) => {
            const p = project(point), x = Math.round(p.x), y = Math.round(p.y);
            if (i === 0)
                ctx.moveTo(x, y);
            else
                ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        drawn++;
    }
    ctx.restore();
    return drawn;
}
/** Compatible with foundation WorldRenderView; sample once, draw each host pass. */
export function drawAtmosphere(ctx, frame, view) {
    const project = point => view.project(point, point.z ?? 0);
    if (view.pass === 'ground')
        return drawAtmosphereLayer(ctx, frame.commands, 'ground', project);
    if (view.pass === 'foreground')
        return drawAtmosphereLayer(ctx, frame.commands, 'light', project) + drawAtmosphereLayer(ctx, frame.commands, 'foreground', project);
    return 0;
}
/** Append these entries to foundation's object queue for actor/roof occlusion. */
export function renderAtmosphereObjects(frame) {
    const groups = new Map();
    for (const command of frame.commands) {
        if (command.layer !== 'objects' || !command.object)
            continue;
        const { id, position, depth } = command.object;
        const group = groups.get(id) ?? { position, depth, commands: [] };
        group.commands.push(command);
        groups.set(id, group);
    }
    return [...groups].map(([id, group]) => ({ id: `atmosphere:${id}`, position: group.position, depth: group.depth,
        draw(ctx, view) { drawAtmosphereLayer(ctx, group.commands, 'objects', point => view.project(point, point.z ?? 0)); },
    }));
}
