const isNodeList = obj => NodeList.prototype.isPrototypeOf(obj);
const isElement = obj => Element.prototype.isPrototypeOf(obj);
const handleGet = (target, prop) => {
	const isTargetArr = Array.isArray(target);
	const isTargetElem = isElement(target);
	if (isTargetArr || isTargetElem) {
		// query selector extensions
		if (prop === 'qq') return queryAll.bind(null, isTargetElem ? target : target[0]);
		if (prop === 'q') return queryOne.bind(null, isTargetElem ? target : target[0]);
		// custom array methods
		if (isTargetArr) {
			if (prop === 'nth') return idx => chain(target[idx < 0 ? target.length + idx : idx]);
			if (prop === 'first') return chain(target[0]);
			if (prop === 'last') return chain(target[target.length - 1]);
		}
	}
	// got here, so do standard get
	const res = Reflect.get(target, prop);
	// if not object just return
	if (typeof res !== 'object') return res && typeof res === 'function' ? res.bind(target) : res;
	// convert NodeLists to arrays and keep chaining
	return chain(isNodeList(res) ? Array.from(res) : res);
};
const chain = obj => obj ? new Proxy(obj, { get: handleGet, set: (target, prop, val) => Reflect.set(target, prop, val) }) : null;
const queryAll = (ctx, sel) => chain(ctx ? Array.from(ctx.querySelectorAll(sel)) : []);
const queryOne = (ctx, sel) => ctx ? chain(ctx.querySelector(sel)) : null;
const qq = (sel, ctx=document) => typeof sel === 'string' ? queryAll(ctx, sel) : chain([sel]);
const q = (sel, ctx=document) => typeof sel === 'string' ? queryOne(ctx, sel) : chain(sel);

export { q, qq };
