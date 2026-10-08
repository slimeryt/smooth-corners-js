const number = (value) => Number(value.toFixed(3));
const radians = (degrees) => (degrees * Math.PI) / 180;
function cornerParams(radius, smoothing, budget) {
    const r = Math.min(radius, budget);
    if (r <= 0)
        return { a: 0, b: 0, c: 0, d: 0, p: 0, arc: 0, r: 0 };
    const s = Math.max(0, Math.min(smoothing, budget / r - 1));
    const p = Math.min((1 + s) * r, budget);
    const arcMeasure = 90 * (1 - s);
    const arc = Math.sin(radians(arcMeasure / 2)) * r * Math.SQRT2;
    const alpha = (90 - arcMeasure) / 2;
    const c = r * Math.tan(radians(alpha / 2)) * Math.cos(radians(45 * s));
    const d = c * Math.tan(radians(45 * s));
    const b = (p - arc - c - d) / 3;
    return { a: 2 * b, b, c, d, p, arc, r };
}
export function createSmoothRectPath(width, height, radii, smoothing = 0.6, originX = 0, originY = 0) {
    if (width <= 0 || height <= 0)
        return '';
    const s = Math.max(0, Math.min(smoothing, 1));
    const budget = Math.min(width, height) / 2;
    const tl = cornerParams(radii.tl, s, budget), tr = cornerParams(radii.tr, s, budget), br = cornerParams(radii.br, s, budget), bl = cornerParams(radii.bl, s, budget);
    const n = number;
    const parts = [`M${n(originX + width - tr.p)} ${n(originY)}`];
    if (tr.r)
        parts.push(`c${n(tr.a)} 0 ${n(tr.a + tr.b)} 0 ${n(tr.a + tr.b + tr.c)} ${n(tr.d)}`, `a${n(tr.r)} ${n(tr.r)} 0 0 1 ${n(tr.arc)} ${n(tr.arc)}`, `c${n(tr.d)} ${n(tr.c)} ${n(tr.d)} ${n(tr.b + tr.c)} ${n(tr.d)} ${n(tr.a + tr.b + tr.c)}`);
    parts.push(`L${n(originX + width)} ${n(originY + height - br.p)}`);
    if (br.r)
        parts.push(`c0 ${n(br.a)} 0 ${n(br.a + br.b)} ${n(-br.d)} ${n(br.a + br.b + br.c)}`, `a${n(br.r)} ${n(br.r)} 0 0 1 ${n(-br.arc)} ${n(br.arc)}`, `c${n(-br.c)} ${n(br.d)} ${n(-(br.b + br.c))} ${n(br.d)} ${n(-(br.a + br.b + br.c))} ${n(br.d)}`);
    parts.push(`L${n(originX + bl.p)} ${n(originY + height)}`);
    if (bl.r)
        parts.push(`c${n(-bl.a)} 0 ${n(-(bl.a + bl.b))} 0 ${n(-(bl.a + bl.b + bl.c))} ${n(-bl.d)}`, `a${n(bl.r)} ${n(bl.r)} 0 0 1 ${n(-bl.arc)} ${n(-bl.arc)}`, `c${n(-bl.d)} ${n(-bl.c)} ${n(-bl.d)} ${n(-(bl.b + bl.c))} ${n(-bl.d)} ${n(-(bl.a + bl.b + bl.c))}`);
    parts.push(`L${n(originX)} ${n(originY + tl.p)}`);
    if (tl.r)
        parts.push(`c0 ${n(-tl.a)} 0 ${n(-(tl.a + tl.b))} ${n(tl.d)} ${n(-(tl.a + tl.b + tl.c))}`, `a${n(tl.r)} ${n(tl.r)} 0 0 1 ${n(tl.arc)} ${n(-tl.arc)}`, `c${n(tl.c)} ${n(-tl.d)} ${n(tl.b + tl.c)} ${n(-tl.d)} ${n(tl.a + tl.b + tl.c)} ${n(-tl.d)}`);
    parts.push('Z');
    return parts.join(' ');
}
export function createSmoothCornerPath(width, height, options) {
    const radius = Math.max(0, options.radius);
    return createSmoothRectPath(width, height, { tl: radius, tr: radius, br: radius, bl: radius }, options.smoothing ?? 0.6);
}
export function applySmoothCorners(element, options) {
    const previous = element.style.clipPath;
    const update = () => {
        const { width, height } = element.getBoundingClientRect();
        const path = createSmoothCornerPath(width, height, options);
        element.style.clipPath = path ? `path("${path}")` : '';
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => { observer.disconnect(); element.style.clipPath = previous; };
}
const OVERRIDDEN = ['border-radius', 'border-color', 'background-color', 'background-image', 'background-size', 'background-origin', 'background-repeat', 'background-position', 'clip-path', 'box-shadow', 'filter'];
const ANIMATABLE = ['background-color', 'border-color', 'color', 'box-shadow', 'opacity', 'transform', 'filter', 'outline-color', 'fill', 'stroke', 'width', 'height', 'margin', 'padding'];
const SHADOW_REACH = 400;
const TRANSPARENT = /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$|^transparent$/;
const COLOR = /rgba?\([^)]*\)|#[0-9a-f]{3,8}\b/i;
function parseShadows(value) {
    if (value === 'none')
        return [];
    const raws = [];
    let depth = 0, start = 0;
    for (let i = 0; i <= value.length; i++) {
        const char = value[i];
        if (char === '(')
            depth++;
        else if (char === ')')
            depth--;
        else if ((char === ',' && depth === 0) || i === value.length) {
            raws.push(value.slice(start, i).trim());
            start = i + 1;
        }
    }
    const layers = [];
    for (const raw of raws) {
        const color = COLOR.exec(raw)?.[0];
        if (!color)
            return null;
        const numbers = (raw.replace(color, '').match(/-?[0-9.]+px/g) ?? []).map(parseFloat);
        if (numbers.length < 2 || numbers.length > 4)
            return null;
        layers.push({ raw, color, x: numbers[0], y: numbers[1], blur: numbers[2] ?? 0, spread: numbers[3] ?? 0, inset: /\binset\b/.test(raw) });
    }
    return layers;
}
const isRing = (layer) => layer.blur === 0 && layer.x === 0 && layer.y === 0 && layer.spread > 0;
export function enableAutoSmoothCorners(options = {}) {
    const smoothing = options.smoothing ?? 0.6;
    const minRadius = options.minRadius ?? 6;
    const saved = new WeakMap();
    const childClips = new WeakMap();
    const transitions = new WeakMap();
    const queue = new Set();
    let frame = 0;
    let touched = new Set();
    const release = (element) => {
        for (const [child, value, priority] of childClips.get(element) ?? []) {
            if (value)
                child.style.setProperty('clip-path', value, priority);
            else
                child.style.removeProperty('clip-path');
        }
        childClips.delete(element);
        const original = saved.get(element);
        if (!original)
            return;
        for (const property of OVERRIDDEN) {
            const [value, priority] = original[property];
            if (value)
                element.style.setProperty(property, value, priority);
            else
                element.style.removeProperty(property);
        }
        saved.delete(element);
    };
    const remember = (element) => {
        const original = {};
        for (const property of OVERRIDDEN)
            original[property] = [element.style.getPropertyValue(property), element.style.getPropertyPriority(property)];
        saved.set(element, original);
    };
    const set = (element, property, value) => { touched.add(property); element.style.setProperty(property, value, 'important'); };
    const transitionWithout = (list) => {
        const skip = new Set(touched);
        const radius = skip.has('border-radius');
        const kept = list.split(',').map(part => part.trim()).flatMap(part => (part === 'all' ? ANIMATABLE : [part]))
            .filter(part => part && !skip.has(part) && !(radius && /radius/.test(part)));
        return kept.length ? kept.join(', ') : 'none';
    };
    const resizer = new ResizeObserver(entries => { for (const entry of entries)
        queue.add(entry.target); schedule(); });
    const process = (element) => {
        const original = saved.has(element) ? transitions.get(element) ?? 'all' : getComputedStyle(element).transitionProperty;
        element.style.setProperty('transition', 'none', 'important');
        touched = new Set();
        let managed = false;
        try {
            release(element);
            managed = apply(element);
        }
        finally {
            element.style.removeProperty('transition');
            if (managed) {
                transitions.set(element, original);
                element.style.setProperty('transition-property', transitionWithout(original), 'important');
            }
            else
                transitions.delete(element);
        }
    };
    const apply = (element) => {
        if (!element.isConnected || element === document.body || element.closest('svg,[data-no-smooth]'))
            return false;
        const style = getComputedStyle(element);
        const parsed = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius];
        if (parsed.some(value => value.includes('%')))
            return false;
        const [tl, tr, br, bl] = parsed.map(value => parseFloat(value) || 0);
        if (Math.max(tl, tr, br, bl) < minRadius)
            return false;
        resizer.observe(element);
        const bounds = element.getBoundingClientRect();
        const width = Math.abs(bounds.width - element.offsetWidth) < 1.5 ? bounds.width : element.offsetWidth;
        const height = Math.abs(bounds.height - element.offsetHeight) < 1.5 ? bounds.height : element.offsetHeight;
        if (width < 12 || height < 12 || style.display === 'contents' || style.display === 'inline')
            return false;
        const fit = Math.min(1, width / (tl + tr || 1), width / (bl + br || 1), height / (tl + bl || 1), height / (tr + br || 1));
        const radii = { tl: tl * fit, tr: tr * fit, br: br * fit, bl: bl * fit };
        if (Math.max(radii.tl, radii.tr, radii.br, radii.bl) >= Math.min(width, height) / 2 - 0.5)
            return false;
        if (style.clipPath !== 'none' || style.filter !== 'none')
            return false;
        const widths = [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth].map(parseFloat);
        const hasBorder = widths.some(value => value > 0);
        if (hasBorder) {
            const colors = [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor];
            const styles = [style.borderTopStyle, style.borderRightStyle, style.borderBottomStyle, style.borderLeftStyle];
            const drawn = widths.map((value, index) => (value > 0 ? index : -1)).filter(index => index >= 0);
            if (new Set(drawn.map(index => colors[index])).size > 1 || drawn.some(index => styles[index] !== 'solid'))
                return false;
        }
        const layers = parseShadows(style.boxShadow);
        if (layers === null)
            return false;
        const rings = layers.filter(isRing);
        const softs = layers.filter(layer => !isRing(layer));
        if (softs.some(layer => layer.inset || layer.spread !== 0))
            return false;
        const tag = element.tagName;
        const media = tag === 'IMG' || tag === 'VIDEO' || tag === 'CANVAS';
        const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
        const scrolls = ['auto', 'scroll'].includes(style.overflowX) || ['auto', 'scroll'].includes(style.overflowY);
        const glass = !!style.backdropFilter && style.backdropFilter !== 'none';
        const hasImage = style.backgroundImage !== 'none';
        const transparent = TRANSPARENT.test(style.backgroundColor);
        if ((hasBorder || rings.length > 0) && hasImage)
            return false;
        if (softs.length > 0 && (media || (hasImage && !glass)))
            return false;
        if (!(media || hasBorder || hasImage || layers.length > 0 || clips || glass || !transparent))
            return false;
        const cornerReach = 1.8 * Math.max(radii.tl, radii.tr, radii.br, radii.bl);
        for (const child of Array.from(element.children)) {
            const position = getComputedStyle(child).position;
            if (position !== 'absolute' && position !== 'fixed')
                continue;
            const box = child.getBoundingClientRect();
            if (!box.width)
                continue;
            const overhangs = box.left < bounds.left - 1 || box.top < bounds.top - 1 || box.right > bounds.right + 1 || box.bottom > bounds.bottom + 1;
            const nearX = box.left < bounds.left + cornerReach || box.right > bounds.right - cornerReach;
            const nearY = box.top < bounds.top + cornerReach || box.bottom > bounds.bottom - cornerReach;
            if (overhangs && nearX && nearY)
                return false;
        }
        const smooth = createSmoothRectPath(width, height, radii, smoothing);
        const paint = !glass && !hasImage && !media && !scrolls;
        const [top, right, bottom, left] = widths;
        const border = Math.max(top, right, bottom, left);
        const borderColor = [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor][widths.findIndex(value => value > 0)];
        const bands = [];
        if (paint && !transparent)
            bands.push(`<path d="${smooth}" fill="${style.backgroundColor}" clip-path="url(#s)"/>`);
        for (const ring of rings)
            bands.push(`<path d="${smooth}" fill="none" stroke="${ring.color}" stroke-width="${2 * (ring.spread + (ring.inset ? border : 0))}" clip-path="url(#s)"/>`);
        if (hasBorder && new Set(widths).size === 1) {
            bands.push(`<path d="${smooth}" fill="none" stroke="${borderColor}" stroke-width="${border * 2}" clip-path="url(#s)"/>`);
        }
        else if (hasBorder) {
            const inner = createSmoothRectPath(width - left - right, height - top - bottom, {
                tl: Math.max(0, radii.tl - Math.max(top, left)), tr: Math.max(0, radii.tr - Math.max(top, right)),
                br: Math.max(0, radii.br - Math.max(bottom, right)), bl: Math.max(0, radii.bl - Math.max(bottom, left)),
            }, smoothing, left, top);
            bands.push(`<path d="${smooth} ${inner}" fill="${borderColor}" fill-rule="evenodd" clip-path="url(#s)"/>`);
        }
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><clipPath id="s"><path d="${smooth}"/></clipPath></defs>${bands.join('')}</svg>`;
        remember(element);
        if (!paint)
            set(element, 'border-radius', '0');
        if (bands.length) {
            if (hasBorder)
                set(element, 'border-color', 'transparent');
            set(element, 'background-image', `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
            set(element, 'background-origin', 'border-box');
            set(element, 'background-size', '100% 100%');
            set(element, 'background-repeat', 'no-repeat');
            set(element, 'background-position', '0 0');
        }
        if (paint) {
            if (!transparent)
                set(element, 'background-color', 'transparent');
            if (layers.length > 0)
                set(element, 'box-shadow', 'none');
            if (softs.length > 0)
                set(element, 'filter', softs.map(layer => `drop-shadow(${layer.x}px ${layer.y}px ${layer.blur}px ${layer.color})`).join(' '));
            if (clips) {
                const reach = cornerReach;
                const clipped = [];
                for (const child of Array.from(element.children)) {
                    if (!(child instanceof HTMLElement) || getComputedStyle(child).clipPath !== 'none')
                        continue;
                    const box = child.getBoundingClientRect();
                    const x = box.left - bounds.left, y = box.top - bounds.top;
                    if (x > reach && y > reach && width - (x + box.width) > reach && height - (y + box.height) > reach)
                        continue;
                    clipped.push([child, child.style.getPropertyValue('clip-path'), child.style.getPropertyPriority('clip-path')]);
                    child.style.setProperty('clip-path', `path("${createSmoothRectPath(width, height, radii, smoothing, -x, -y)}")`, 'important');
                }
                if (clipped.length)
                    childClips.set(element, clipped);
            }
        }
        else {
            if (rings.length > 0)
                set(element, 'box-shadow', softs.map(layer => layer.raw).join(', ') || 'none');
            const edge = SHADOW_REACH, pad = 1;
            set(element, 'clip-path', `path(evenodd, "M${-edge} ${-edge}H${width + edge}V${height + edge}H${-edge}ZM${-pad} ${-pad}H${width + pad}V${height + pad}H${-pad}Z${smooth}")`);
        }
        return true;
    };
    const flush = () => {
        frame = 0;
        const items = [...queue];
        queue.clear();
        for (const element of items) {
            try {
                process(element);
            }
            catch (error) {
                console.error('smooth-corners skipped an element', element, error);
            }
        }
        observer.takeRecords();
    };
    const schedule = () => { if (!frame)
        frame = requestAnimationFrame(flush); };
    const enqueueTree = (node) => {
        if (!(node instanceof HTMLElement))
            return;
        queue.add(node);
        node.querySelectorAll('*').forEach(child => queue.add(child));
    };
    const observer = new MutationObserver(records => {
        for (const record of records) {
            if (record.type === 'childList')
                record.addedNodes.forEach(enqueueTree);
            else if (record.target instanceof HTMLElement)
                queue.add(record.target);
        }
        schedule();
    });
    const themeObserver = new MutationObserver(() => { enqueueTree(document.body); schedule(); });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'aria-selected', 'aria-expanded', 'aria-pressed', 'disabled', 'open'] });
    const interaction = (event) => {
        for (let node = event.target; node && node !== document.body; node = node.parentElement)
            queue.add(node);
        schedule();
    };
    const events = ['mouseover', 'mouseout', 'focusin', 'focusout', 'transitionend', 'animationend'];
    events.forEach(name => document.addEventListener(name, interaction, true));
    enqueueTree(document.body);
    schedule();
    return () => {
        observer.disconnect();
        themeObserver.disconnect();
        resizer.disconnect();
        events.forEach(name => document.removeEventListener(name, interaction, true));
        cancelAnimationFrame(frame);
        document.querySelectorAll('*').forEach(element => { if (saved.has(element))
            element.style.removeProperty('transition-property'); release(element); });
    };
}
