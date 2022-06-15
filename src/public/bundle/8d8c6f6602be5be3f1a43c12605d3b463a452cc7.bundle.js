// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const isSSR = ()=>typeof _nano !== 'undefined' && _nano.isSSR === true
;
const tick = Promise.prototype.then.bind(Promise.resolve());
const removeAllChildNodes = (parent)=>{
    while(parent.firstChild){
        parent.removeChild(parent.firstChild);
    }
};
const strToHash = (s)=>{
    let hash = 0;
    for(let i = 0; i < s.length; i++){
        const chr = s.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0;
    }
    return Math.abs(hash).toString(32);
};
const appendChildren = (element, children, escape = true)=>{
    if (!Array.isArray(children)) {
        appendChildren(element, [
            children
        ], escape);
        return;
    }
    if (typeof children === 'object') children = Array.prototype.slice.call(children);
    children.forEach((child)=>{
        if (Array.isArray(child)) appendChildren(element, child, escape);
        else {
            const c = _render(child);
            if (typeof c !== 'undefined') {
                if (Array.isArray(c)) appendChildren(element, c, escape);
                else {
                    if (isSSR() && !escape) element.appendChild(c.nodeType == null ? c.toString() : c);
                    else element.appendChild(c.nodeType == null ? document.createTextNode(c.toString()) : c);
                }
            }
        }
    });
};
const SVG = (props)=>{
    const child = props.children[0];
    const attrs = child.attributes;
    if (isSSR()) return child;
    const svg = hNS('svg');
    for(let i = attrs.length - 1; i >= 0; i--){
        svg.setAttribute(attrs[i].name, attrs[i].value);
    }
    svg.innerHTML = child.innerHTML;
    return svg;
};
const render = (component, parent = null, removeChildNodes = true)=>{
    let el = _render(component);
    if (Array.isArray(el)) {
        el = el.map((e)=>_render(e)
        );
        if (el.length === 1) el = el[0];
    }
    if (parent) {
        if (removeChildNodes) removeAllChildNodes(parent);
        if (el && parent.id && parent.id === el.id && parent.parentElement) {
            parent.parentElement.replaceChild(el, parent);
        } else {
            if (Array.isArray(el)) el.forEach((e)=>{
                appendChildren(parent, _render(e));
            });
            else appendChildren(parent, _render(el));
        }
        return parent;
    } else {
        if (isSSR() && !Array.isArray(el)) return [
            el
        ];
        return el;
    }
};
const hydrate = render;
const _render = (comp)=>{
    if (comp === null || comp === false || typeof comp === 'undefined') return [];
    if (typeof comp === 'string' || typeof comp === 'number') return comp.toString();
    if (comp.tagName && comp.tagName.toLowerCase() === 'svg') return SVG({
        children: [
            comp
        ]
    });
    if (comp.tagName) return comp;
    if (comp && comp.component && comp.component.isClass) return renderClassComponent(comp);
    if (comp.isClass) return renderClassComponent({
        component: comp,
        props: {}
    });
    if (comp.component && typeof comp.component === 'function') return renderFunctionalComponent(comp);
    if (Array.isArray(comp)) return comp.map((c)=>_render(c)
    ).flat();
    if (typeof comp === 'function' && !comp.isClass) return _render(comp());
    if (comp.component && comp.component.tagName && typeof comp.component.tagName === 'string') return _render(comp.component);
    if (Array.isArray(comp.component)) return _render(comp.component);
    if (comp.component) return _render(comp.component);
    if (typeof comp === 'object') return [];
    console.warn('Something unexpected happened with:', comp);
};
const renderFunctionalComponent = (fncComp)=>{
    const { component , props  } = fncComp;
    return _render(component(props));
};
const renderClassComponent = (classComp)=>{
    const { component , props  } = classComp;
    const hash = strToHash(component.toString());
    component.prototype._getHash = ()=>hash
    ;
    const Component = new component(props);
    if (!isSSR()) Component.willMount();
    let el = Component.render();
    el = _render(el);
    Component.elements = el;
    if (props && props.ref) props.ref(Component);
    if (!isSSR()) tick(()=>{
        Component._didMount();
    });
    return el;
};
const hNS = (tag)=>document.createElementNS('http://www.w3.org/2000/svg', tag)
;
const h = (tagNameOrComponent, props = {}, ...children)=>{
    if (props && props.children) {
        if (Array.isArray(children)) {
            if (Array.isArray(props.children)) children = [
                ...props.children,
                ...children
            ];
            else children.push(props.children);
        } else {
            if (Array.isArray(props.children)) children = props.children;
            else children = [
                props.children
            ];
        }
    }
    if (isSSR() && _nano.ssrTricks.isWebComponent(tagNameOrComponent)) {
        const element = _nano.ssrTricks.renderWebComponent(tagNameOrComponent, props, children, _render);
        if (element === null) return `ERROR: "<${tagNameOrComponent} />"`;
        else return element;
    }
    if (typeof tagNameOrComponent !== 'string') return {
        component: tagNameOrComponent,
        props: {
            ...props,
            children: children
        }
    };
    let ref;
    const element = tagNameOrComponent === 'svg' ? hNS('svg') : document.createElement(tagNameOrComponent);
    const isEvent = (el, p)=>{
        if (0 !== p.indexOf('on')) return false;
        if (el._ssr) return true;
        return typeof el[p] === 'object' || typeof el[p] === 'function';
    };
    for(const p1 in props){
        if (p1 === 'style' && typeof props[p1] === 'object') {
            const styles = Object.keys(props[p1]).map((k)=>`${k}:${props[p1][k]}`
            ).join(';').replace(/[A-Z]/g, (match)=>`-${match.toLowerCase()}`
            );
            props[p1] = `${styles};`;
        }
        if (p1 === 'ref') ref = props[p1];
        else if (isEvent(element, p1.toLowerCase())) element.addEventListener(p1.toLowerCase().substring(2), (e)=>props[p1](e)
        );
        else if (p1 === 'dangerouslySetInnerHTML' && props[p1].__html) {
            if (!isSSR()) {
                const fragment = document.createElement('fragment');
                fragment.innerHTML = props[p1].__html;
                element.appendChild(fragment);
            } else {
                element.innerHTML = props[p1].__html;
            }
        } else if (p1 === 'innerHTML' && props[p1].__dangerousHtml) {
            if (!isSSR()) {
                const fragment = document.createElement('fragment');
                fragment.innerHTML = props[p1].__dangerousHtml;
                element.appendChild(fragment);
            } else {
                element.innerHTML = props[p1].__dangerousHtml;
            }
        } else if (/className/i.test(p1)) console.warn('You can use "class" instead of "className".');
        else if (typeof props[p1] !== 'undefined') element.setAttribute(p1, props[p1]);
    }
    const escape = ![
        'noscript',
        'script',
        'style'
    ].includes(tagNameOrComponent);
    appendChildren(element, children, escape);
    if (ref) ref(element);
    return element;
};
const detectSSR = ()=>{
    const isDeno = typeof Deno !== 'undefined';
    const hasWindow = typeof window !== 'undefined' ? true : false;
    return typeof _nano !== 'undefined' && _nano.isSSR || isDeno || !hasWindow;
};
const escapeHtml = (unsafe)=>{
    if (unsafe && typeof unsafe === 'string') return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    return unsafe;
};
class HTMLElementSSR {
    tagName;
    isSelfClosing = false;
    nodeType = null;
    _ssr;
    constructor(tag){
        this.tagName = tag;
        const selfClosing = [
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr'
        ];
        this.nodeType = 1;
        if (selfClosing.indexOf(tag) >= 0) {
            this._ssr = `<${tag} />`;
            this.isSelfClosing = true;
        } else {
            this._ssr = `<${tag}></${tag}>`;
        }
    }
    get outerHTML() {
        return this.toString();
    }
    get innerHTML() {
        return this.innerText;
    }
    set innerHTML(text) {
        this.innerText = text;
    }
    get innerText() {
        const reg = /(^<[^>]+>)(.+)?(<\/[a-z0-9]+>$|\/>$)/gm;
        return reg.exec(this._ssr)?.[2] || '';
    }
    set innerText(text) {
        const reg = /(^<[^>]+>)(.+)?(<\/[a-z0-9]+>$|\/>$)/gm;
        this._ssr = this._ssr.replace(reg, `$1${text}$3`);
    }
    getAttribute(_name) {
        return null;
    }
    get classList() {
        const element = this._ssr;
        const classesRegex = /^<\w+.+(\sclass=")([^"]+)"/gm;
        return {
            add: (name)=>{
                this.setAttribute('class', name);
            },
            entries: {
                get length () {
                    const classes = classesRegex.exec(element);
                    if (classes && classes[2]) return classes[2].split(' ').length;
                    return 0;
                }
            }
        };
    }
    toString() {
        return this._ssr;
    }
    setAttributeNS(_namespace, name, value) {
        this.setAttribute(name, value);
    }
    setAttribute(name, value) {
        if (this.isSelfClosing) this._ssr = this._ssr.replace(/(^<[a-z0-9]+ )(.+)/gm, `$1${escapeHtml(name)}="${escapeHtml(value)}" $2`);
        else this._ssr = this._ssr.replace(/(^<[^>]+)(.+)/gm, `$1 ${escapeHtml(name)}="${escapeHtml(value)}"$2`);
    }
    append(child) {
        this.appendChild(child);
    }
    appendChild(child) {
        const index = this._ssr.lastIndexOf('</');
        this._ssr = this._ssr.substring(0, index) + child + this._ssr.substring(index);
    }
    get children() {
        const reg = /<([a-z0-9]+)((?!<\/\1).)*<\/\1>/gms;
        const array = [];
        let match;
        while((match = reg.exec(this.innerHTML)) !== null){
            array.push(match[0].replace(/[\s]+/gm, ' '));
        }
        return array;
    }
    addEventListener(_type, _listener, _options) {}
}
class DocumentSSR {
    body;
    head;
    constructor(){
        this.body = this.createElement('body');
        this.head = this.createElement('head');
    }
    createElement(tag) {
        return new HTMLElementSSR(tag);
    }
    createElementNS(_URI, tag) {
        return this.createElement(tag);
    }
    createTextNode(text) {
        return escapeHtml(text);
    }
    querySelector(_query) {
        return undefined;
    }
}
const documentSSR = ()=>{
    return new DocumentSSR();
};
new Map();
const ssrTricks = {
    isWebComponent: (tagNameOrComponent)=>{
        return typeof tagNameOrComponent === 'string' && tagNameOrComponent.includes('-') && _nano.customElements.has(tagNameOrComponent);
    },
    renderWebComponent: (tagNameOrComponent, props, children, _render1)=>{
        const customElement = _nano.customElements.get(tagNameOrComponent);
        const component = _render1({
            component: customElement,
            props: {
                ...props,
                children: children
            }
        });
        const match1 = component.toString().match(/^<(?<tag>[a-z]+)>(.*)<\/\k<tag>>$/);
        if (match1) {
            const element = document.createElement(match1[1]);
            element.innerText = match1[2];
            function replacer(match, p1, _offset, _string) {
                return match.replace(p1, '');
            }
            element.innerText = element.innerText.replace(/<\w+[^>]*(\s(on\w*)="[^"]*")/gm, replacer);
            return element;
        } else {
            return null;
        }
    }
};
const initGlobalVar = ()=>{
    const isSSR1 = detectSSR() === true ? true : undefined;
    const location = {
        pathname: '/'
    };
    const document = isSSR1 ? documentSSR() : window.document;
    globalThis._nano = {
        isSSR: isSSR1,
        location,
        document,
        customElements: new Map(),
        ssrTricks
    };
};
initGlobalVar();
const MODE_SLASH = 0;
const MODE_TEXT = 1;
const MODE_WHITESPACE = 2;
const MODE_TAGNAME = 3;
const MODE_COMMENT = 4;
const MODE_PROP_SET = 5;
const MODE_PROP_APPEND = 6;
const CHILD_APPEND = 0;
const evaluate = (h1, built, fields, args)=>{
    let tmp;
    built[0] = 0;
    for(let i = 1; i < built.length; i++){
        const type = built[i++];
        const value = built[i] ? (built[0] |= type ? 1 : 2, fields[built[i++]]) : built[++i];
        if (type === 3) {
            args[0] = value;
        } else if (type === 4) {
            args[1] = Object.assign(args[1] || {}, value);
        } else if (type === 5) {
            (args[1] = args[1] || {})[built[++i]] = value;
        } else if (type === 6) {
            args[1][built[++i]] += `${value}`;
        } else if (type) {
            tmp = h1.apply(value, evaluate(h1, value, fields, [
                '',
                null
            ]));
            args.push(tmp);
            if (value[0]) {
                built[0] |= 2;
            } else {
                built[i - 2] = CHILD_APPEND;
                built[i] = tmp;
            }
        } else {
            args.push(value);
        }
    }
    return args;
};
const build = function(statics, ...rest) {
    let mode = 1;
    let buffer = '';
    let quote = '';
    let current = [
        0
    ];
    let __char;
    let propName;
    const commit = (field)=>{
        if (mode === 1 && (field || (buffer = buffer.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))) {
            {
                current.push(0, field, buffer);
            }
        } else if (mode === 3 && (field || buffer)) {
            {
                current.push(3, field, buffer);
            }
            mode = MODE_WHITESPACE;
        } else if (mode === 2 && buffer === '...' && field) {
            {
                current.push(4, field, 0);
            }
        } else if (mode === 2 && buffer && !field) {
            {
                current.push(5, 0, true, buffer);
            }
        } else if (mode >= 5) {
            {
                if (buffer || !field && mode === 5) {
                    current.push(mode, 0, buffer, propName);
                    mode = MODE_PROP_APPEND;
                }
                if (field) {
                    current.push(mode, field, 0, propName);
                    mode = MODE_PROP_APPEND;
                }
            }
        }
        buffer = '';
    };
    for(let i = 0; i < statics.length; i++){
        if (i) {
            if (mode === 1) {
                commit();
            }
            commit(i);
        }
        for(let j = 0; j < statics[i].length; j++){
            __char = statics[i][j];
            if (mode === 1) {
                if (__char === '<') {
                    commit();
                    {
                        current = [
                            current
                        ];
                    }
                    mode = MODE_TAGNAME;
                } else {
                    buffer += __char;
                }
            } else if (mode === 4) {
                if (buffer === '--' && __char === '>') {
                    mode = MODE_TEXT;
                    buffer = '';
                } else {
                    buffer = __char + buffer[0];
                }
            } else if (quote) {
                if (__char === quote) {
                    quote = '';
                } else {
                    buffer += __char;
                }
            } else if (__char === '"' || __char === "'") {
                quote = __char;
            } else if (__char === '>') {
                commit();
                mode = MODE_TEXT;
            } else if (!mode) {} else if (__char === '=') {
                mode = MODE_PROP_SET;
                propName = buffer;
                buffer = '';
            } else if (__char === '/' && (mode < 5 || statics[i][j + 1] === '>')) {
                commit();
                if (mode === 3) {
                    current = current[0];
                }
                mode = current;
                {
                    (current = current[0]).push(2, 0, mode);
                }
                mode = MODE_SLASH;
            } else if (__char === ' ' || __char === '\t' || __char === '\n' || __char === '\r') {
                commit();
                mode = MODE_WHITESPACE;
            } else {
                buffer += __char;
            }
            if (mode === 3 && buffer === '!--') {
                mode = MODE_COMMENT;
                current = current[0];
            }
        }
    }
    commit();
    return current;
};
const CACHES = new Map();
const regular = function(statics) {
    let tmp = CACHES.get(this);
    if (!tmp) {
        tmp = new Map();
        CACHES.set(this, tmp);
    }
    tmp = evaluate(this, tmp.get(statics) || (tmp.set(statics, tmp = build(statics)), tmp), arguments, []);
    return tmp.length > 1 ? tmp : tmp[0];
};
const __default = false ? build : regular;
__default.bind(h);
const ROUTE_PARAMS = "__ROUTE_PARAMS__";
function useRouteParams() {
    if (typeof document === "undefined" || typeof document.getElementById !== "function") {
        return {
            params: {},
            query: {}
        };
    }
    const element = document.getElementById(ROUTE_PARAMS);
    if (element == null) {
        throw new Error(`Expected element with id '${ROUTE_PARAMS}'`);
    }
    const json = element.textContent;
    if (json == null) {
        return {
            params: {},
            query: {}
        };
    }
    const { params , query  } = JSON.parse(json);
    return {
        params,
        query
    };
}
function GoodBye(data) {
    const q = useRouteParams();
    console.log(q);
    return h("h2", {
        style: "color: red"
    }, "Hello ", JSON.stringify(data));
}
hydrate(GoodBye, document.getElementById("root"));

