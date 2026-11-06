export function project(point, camera, z = 0) {
    const x = point.x - camera.focus.x, y = point.y - camera.focus.y;
    return { x: camera.width / 2 + (x - y) * camera.scale, y: camera.height / 2 + (x + y) * camera.scale * .5 - z * camera.scale + (camera.offsetY ?? 0) };
}
export function unproject(point, camera) {
    const u = (point.x - camera.width / 2) / camera.scale, v = (point.y - camera.height / 2 - (camera.offsetY ?? 0)) / (camera.scale * .5);
    return { x: camera.focus.x + (u + v) / 2, y: camera.focus.y + (v - u) / 2 };
}
export function pointerGround(client, rect, camera) {
    return unproject({ x: (client.x - rect.left) * camera.width / rect.width, y: (client.y - rect.top) * camera.height / rect.height }, camera);
}
export function cameraForMap(bounds, position, width, height, scale, insetBottom = 0) {
    const safeHeight = Math.max(height * .35, height - insetBottom);
    const minX = -bounds.height * scale, maxX = bounds.width * scale, maxY = (bounds.width + bounds.height) * scale * .5;
    const clamp = (n, min, max) => min > max ? (min + max) / 2 : Math.max(min, Math.min(max, n));
    const x = clamp((position.x - position.y) * scale, minX + width / 2, maxX - width / 2);
    const y = clamp((position.x + position.y) * scale * .5, safeHeight / 2, maxY - safeHeight / 2);
    return { focus: { x: (x / scale + y / (scale * .5)) / 2, y: (y / (scale * .5) - x / scale) / 2 }, width, height, scale, offsetY: (safeHeight - height) / 2 };
}
