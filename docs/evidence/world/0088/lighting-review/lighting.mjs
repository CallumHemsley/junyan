import { shadeAtmosphereColor } from "./atmosphere.mjs";
const shaders = new Map();
export function colorShader(light) {
    const key = JSON.stringify(light);
    const prior = shaders.get(key);
    if (prior)
        return prior;
    const cache = new Map(), outputs = new Set();
    const shade = (base, exposure = 1) => {
        if (typeof base === "string" && outputs.has(base))
            return base;
        const id = `${base}/${exposure}`, known = cache.get(id);
        if (known)
            return known;
        let rgb, alpha = "";
        if (typeof base !== "string")
            rgb = base;
        else if (/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(base)) {
            rgb = [parseInt(base.slice(1, 3), 16), parseInt(base.slice(3, 5), 16), parseInt(base.slice(5, 7), 16)];
            alpha = base.slice(7);
        }
        else {
            const match = base.match(/^rgba?\(\s*(\d+)\s*[, ]\s*(\d+)\s*[, ]\s*(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)$/);
            if (!match)
                return base;
            rgb = [Number(match[1]), Number(match[2]), Number(match[3])];
            if (match[4])
                alpha = Math.round(Number(match[4]) * 255).toString(16).padStart(2, "0");
        }
        const value = "#" + shadeAtmosphereColor(rgb, light, exposure).map(v => Math.round(v).toString(16).padStart(2, "0")).join("") + alpha;
        cache.set(id, value);
        outputs.add(value);
        return value;
    };
    shaders.set(key, shade);
    return shade;
}
export function shadedContext(context, shade) {
    return new Proxy(context, { get(target, key) { const value = Reflect.get(target, key, target); return typeof value === "function" ? value.bind(target) : value; }, set(target, key, value) { return Reflect.set(target, key, (key === "fillStyle" || key === "strokeStyle") && typeof value === "string" ? shade(value) : value, target); } });
}
