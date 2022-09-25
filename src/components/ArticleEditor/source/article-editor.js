if (typeof CodeMirror === 'undefined') {
    var CodeMirror = undefined;
}
(function () {
    const allImports = require('./modules');
    var Ajax = {};
    Ajax.settings = {};
    Ajax.post = function (options) {
        return new AjaxRequest('post', options);
    };
    Ajax.get = function (options) {
        return new AjaxRequest('get', options);
    };
    Ajax.request = function (method, options) {
        return new AjaxRequest(method, options);
    };
    var AjaxRequest = function (method, options) {
        var defaults = {
            method: method,
            url: '',
            before: function () {},
            success: function () {},
            error: function () {},
            data: false,
            async: true,
            headers: {},
        };
        this.p = this.extend(defaults, options);
        this.p = this.extend(this.p, Ajax.settings);
        this.p.method = this.p.method.toUpperCase();
        this.prepareData();
        this.xhr = new XMLHttpRequest();
        this.xhr.open(this.p.method, this.p.url, this.p.async);
        this.setHeaders();
        var before = typeof this.p.before === 'function' ? this.p.before(this.xhr) : true;
        if (before !== false) {
            this.send();
        }
    };
    AjaxRequest.prototype = {
        extend: function (obj1, obj2) {
            if (obj2)
                for (var name in obj2) {
                    obj1[name] = obj2[name];
                }
            return obj1;
        },
        prepareData: function () {
            if (['POST', 'PUT'].indexOf(this.p.method) !== -1 && !this.isFormData())
                this.p.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            if (typeof this.p.data === 'object' && !this.isFormData()) this.p.data = this.toParams(this.p.data);
            if (this.p.method === 'GET') {
                var sign = this.p.url.search(/\?/) !== -1 ? '&' : '?';
                this.p.url = this.p.data ? this.p.url + sign + this.p.data : this.p.url;
            }
        },
        setHeaders: function () {
            this.xhr.setRequestHeader('X-Requested-With', this.p.headers['X-Requested-With'] || 'XMLHttpRequest');
            for (var name in this.p.headers) {
                this.xhr.setRequestHeader(name, this.p.headers[name]);
            }
        },
        isFormData: function () {
            return typeof window.FormData !== 'undefined' && this.p.data instanceof window.FormData;
        },
        isComplete: function () {
            return !(this.xhr.status < 200 || (this.xhr.status >= 300 && this.xhr.status !== 304));
        },
        send: function () {
            if (this.p.async) {
                this.xhr.onload = this.loaded.bind(this);
                this.xhr.send(this.p.data);
            } else {
                this.xhr.send(this.p.data);
                this.loaded.call(this);
            }
        },
        loaded: function () {
            var response;
            if (this.isComplete()) {
                response = this.parseResponse();
                if (typeof this.p.success === 'function') this.p.success(response, this.xhr);
            } else {
                response = this.parseResponse();
                if (typeof this.p.error === 'function') this.p.error(response, this.xhr, this.xhr.status);
            }
        },
        parseResponse: function () {
            var response = this.xhr.response;
            var json = this.parseJson(response);
            return json ? json : response;
        },
        parseJson: function (str) {
            try {
                var o = JSON.parse(str);
                if (o && typeof o === 'object') {
                    return o;
                }
            } catch (e) {
                return false;
            }
            return false;
        },
        toParams: function (obj) {
            return Object.keys(obj)
                .map(function (k) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]);
                })
                .join('&');
        },
    };
    var DomCache = [0];
    var DomExpando = 'data' + new Date().getTime();
    var Dom = function (selector, context) {
        return this.parse(selector, context);
    };
    Dom.ready = function (fn) {
        document.addEventListener('DOMContentLoaded', fn);
    };
    Dom.prototype = {
        get length() {
            return this.nodes.length;
        },
        parse: function (s, c) {
            var n;
            var rehtml = /^\s*<(\w+|!)[^>]*>/;
            if (!s) {
                n = [];
            } else if (s instanceof Dom) {
                this.nodes = s.nodes;
                return s;
            } else if (rehtml.test(s)) {
                n = this.create(s);
            } else if (typeof s !== 'string') {
                if (s.nodeType && s.nodeType === 11) n = s.childNodes;
                else n = s.nodeType || this._isWindowNode(s) ? [s] : s;
            } else {
                n = this._query(s, c);
            }
            this.nodes = this._slice(n);
        },
        create: function (html) {
            if (/^<(\w+)\s*\/?>(?:<\/\1>|)$/.test(html)) {
                return [document.createElement(RegExp.$1)];
            }
            var elmns = [];
            var c = document.createElement('div');
            c.innerHTML = html;
            for (var i = 0, l = c.childNodes.length; i < l; i++) {
                elmns.push(c.childNodes[i]);
            }
            return elmns;
        },
        dataset: function (key, value) {
            return this.each(function ($node) {
                DomCache[this.dataindex($node.get())][key] = value;
            });
        },
        dataget: function (key) {
            return DomCache[this.dataindex(this.get())][key];
        },
        dataindex: function (el) {
            var index = el[DomExpando];
            var nextIndex = DomCache.length;
            if (!index) {
                index = nextIndex;
                if (el) el[DomExpando] = nextIndex;
                DomCache[index] = {};
            }
            return index;
        },
        add: function (n) {
            this.nodes = this.nodes.concat(this._array(n));
            return this;
        },
        get: function (index) {
            return this.nodes[index || 0] || false;
        },
        getAll: function () {
            return this.nodes;
        },
        eq: function (index) {
            return new Dom(this.nodes[index]);
        },
        first: function () {
            return new Dom(this.nodes[0]);
        },
        last: function () {
            return new Dom(this.nodes[this.nodes.length - 1]);
        },
        contents: function () {
            return this.get().childNodes;
        },
        each: function (fn) {
            var len = this.nodes.length;
            for (var i = 0; i < len; i++) {
                fn.call(this, new Dom(this.nodes[i]), i);
            }
            return this;
        },
        is: function (s) {
            return this.filter(s).length > 0;
        },
        filter: function (s) {
            var fn;
            if (s === undefined) {
                return this;
            } else if (typeof s === 'function') {
                fn = function (node) {
                    return s(new Dom(node));
                };
            } else {
                fn = function (node) {
                    if ((s && s.nodeType) || s instanceof Node) {
                        return s === node;
                    } else {
                        node.matches = node.matches || node.msMatchesSelector || node.webkitMatchesSelector;
                        return node.nodeType === 1 ? node.matches(s || '*') : false;
                    }
                };
            }
            return new Dom(this.nodes.filter.call(this.nodes, fn));
        },
        not: function (filter) {
            return this.filter(function (node) {
                return !new Dom(node).is(filter || true);
            });
        },
        find: function (s) {
            var n = [];
            this.each(function ($n) {
                var node = $n.get();
                var ns = this._query(s, node);
                for (var i = 0; i < ns.length; i++) {
                    n.push(ns[i]);
                }
            });
            return new Dom(n);
        },
        children: function (s) {
            var n = [];
            this.each(function ($n) {
                var node = $n.get();
                if (node.children) {
                    var ns = node.children;
                    for (var i = 0; i < ns.length; i++) {
                        n.push(ns[i]);
                    }
                }
            });
            return new Dom(n).filter(s);
        },
        parent: function (s) {
            var node = this.get();
            var p = node.parentNode ? node.parentNode : false;
            return p ? new Dom(p).filter(s) : new Dom();
        },
        parents: function (s, c) {
            c = this._context(c);
            var n = [];
            this.each(function ($n) {
                var node = $n.get();
                var p = node.parentNode;
                while (p && p !== c) {
                    if (s) {
                        if (new Dom(p).is(s)) {
                            n.push(p);
                        }
                    } else {
                        n.push(p);
                    }
                    p = p.parentNode;
                }
            });
            return new Dom(n);
        },
        closest: function (s, c) {
            c = this._context(c);
            var n = [];
            var isNode = s && s.nodeType;
            this.each(function ($n) {
                var node = $n.get();
                do {
                    if (node && ((isNode && node === s) || new Dom(node).is(s))) {
                        return n.push(node);
                    }
                } while ((node = node.parentNode) && node !== c);
            });
            return new Dom(n);
        },
        next: function (s) {
            return this._sibling(s, 'nextSibling');
        },
        nextElement: function (s) {
            return this._sibling(s, 'nextElementSibling');
        },
        prev: function (s) {
            return this._sibling(s, 'previousSibling');
        },
        prevElement: function (s) {
            return this._sibling(s, 'previousElementSibling');
        },
        css: function (name, value) {
            if (value === undefined && typeof name !== 'object') {
                var node = this.get();
                if (name === 'width' || name === 'height') {
                    const boundingSpecs = node.getBoundingClientRect();
                    return boundingSpecs[name] + 'px';
                } else {
                    return node.style ? getComputedStyle(node, null)[name] : undefined;
                }
            }
            return this.each(function ($n) {
                var node = $n.get();
                var o = {};
                if (typeof name === 'object') o = name;
                else o[name] = value;
                for (var key in o) {
                    if (node.style) node.style[key] = o[key];
                }
            });
        },
        attr: function (name, value, data) {
            data = data ? 'data-' : '';
            if (typeof value === 'undefined' && typeof name !== 'object') {
                var node = this.get();
                if (node && node.nodeType !== 3) {
                    return name === 'checked' ? node.checked : this._boolean(node.getAttribute(data + name));
                } else {
                    return;
                }
            }
            return this.each(function ($n) {
                var node = $n.get();
                var o = {};
                if (typeof name === 'object') o = name;
                else o[name] = value;
                for (var key in o) {
                    if (node.nodeType !== 3) {
                        if (key === 'checked') node.checked = o[key];
                        else node.setAttribute(data + key, o[key]);
                    }
                }
            });
        },
        data: function (name, value) {
            if (name === undefined) {
                var reDataAttr = /^data-(.+)$/;
                var attrs = this.get().attributes;
                var data = {};
                var replacer = function (g) {
                    return g[1].toUpperCase();
                };
                for (var key in attrs) {
                    if (attrs[key] && reDataAttr.test(attrs[key].nodeName)) {
                        var dataName = attrs[key].nodeName.match(reDataAttr)[1];
                        var val = attrs[key].value;
                        dataName = dataName.replace(/-([a-z])/g, replacer);
                        if (val.search(/^{/) !== -1) val = this._object(val);
                        else val = this._number(val) ? parseFloat(val) : this._boolean(val);
                        data[dataName] = val;
                    }
                }
                return data;
            }
            return this.attr(name, value, true);
        },
        val: function (value) {
            if (value === undefined) {
                var el = this.get();
                if (el.type && el.type === 'checkbox') return el.checked;
                else return el.value;
            }
            return this.each(function ($n) {
                var el = $n.get();
                if (el.type && el.type === 'checkbox') el.checked = value;
                else el.value = value;
            });
        },
        removeAttr: function (value) {
            return this.each(function ($n) {
                var node = $n.get();
                var fn = function (name) {
                    if (node.nodeType !== 3) node.removeAttribute(name);
                };
                value.split(' ').forEach(fn);
            });
        },
        addClass: function (value) {
            return this._eachClass(value, 'add');
        },
        removeClass: function (value) {
            return this._eachClass(value, 'remove');
        },
        toggleClass: function (value) {
            return this._eachClass(value, 'toggle');
        },
        hasClass: function (value) {
            var node = this.get();
            return node.classList ? node.classList.contains(value) : false;
        },
        empty: function () {
            return this.each(function ($n) {
                $n.get().innerHTML = '';
            });
        },
        html: function (html) {
            return html === undefined ? this.get().innerHTML || '' : this.empty().append(html);
        },
        text: function (text) {
            return text === undefined
                ? this.get().textContent || ''
                : this.each(function ($n) {
                      $n.get().textContent = text;
                  });
        },
        after: function (html) {
            return this._inject(html, function (frag, node) {
                if (typeof frag === 'string') {
                    node.insertAdjacentHTML('afterend', frag);
                } else {
                    if (node.parentNode !== null) {
                        for (
                            var i = frag instanceof Node ? [frag] : this._array(frag).reverse(), s = 0;
                            s < i.length;
                            s++
                        ) {
                            node.parentNode.insertBefore(i[s], node.nextSibling);
                        }
                    }
                }
                return node;
            });
        },
        before: function (html) {
            return this._inject(html, function (frag, node) {
                if (typeof frag === 'string') {
                    node.insertAdjacentHTML('beforebegin', frag);
                } else {
                    var elms = frag instanceof Node ? [frag] : this._array(frag);
                    for (var i = 0; i < elms.length; i++) {
                        node.parentNode.insertBefore(elms[i], node);
                    }
                }
                return node;
            });
        },
        append: function (html) {
            return this._inject(html, function (frag, node) {
                if (typeof frag === 'string' || typeof frag === 'number') {
                    node.insertAdjacentHTML('beforeend', frag);
                } else {
                    var elms = frag instanceof Node ? [frag] : this._array(frag);
                    for (var i = 0; i < elms.length; i++) {
                        node.appendChild(elms[i]);
                    }
                }
                return node;
            });
        },
        prepend: function (html) {
            return this._inject(html, function (frag, node) {
                if (typeof frag === 'string' || typeof frag === 'number') {
                    node.insertAdjacentHTML('afterbegin', frag);
                } else {
                    var elms = frag instanceof Node ? [frag] : this._array(frag).reverse();
                    for (var i = 0; i < elms.length; i++) {
                        node.insertBefore(elms[i], node.firstChild);
                    }
                }
                return node;
            });
        },
        wrap: function (html) {
            return this._inject(html, function (frag, node) {
                var wrapper =
                    typeof frag === 'string' || typeof frag === 'number'
                        ? this.create(frag)[0]
                        : frag instanceof Node
                        ? frag
                        : this._array(frag)[0];
                if (node.parentNode) {
                    node.parentNode.insertBefore(wrapper, node);
                }
                wrapper.appendChild(node);
                return wrapper;
            });
        },
        unwrap: function () {
            return this.each(function ($n) {
                var node = $n.get();
                var docFrag = document.createDocumentFragment();
                while (node.firstChild) {
                    var child = node.removeChild(node.firstChild);
                    docFrag.appendChild(child);
                }
                node.parentNode.replaceChild(docFrag, node);
            });
        },
        replaceWith: function (html) {
            return this._inject(html, function (frag, node) {
                var docFrag = document.createDocumentFragment();
                var elms =
                    typeof frag === 'string' || typeof frag === 'number'
                        ? this.create(frag)
                        : frag instanceof Node
                        ? [frag]
                        : this._array(frag);
                for (var i = 0; i < elms.length; i++) {
                    docFrag.appendChild(elms[i]);
                }
                var result = docFrag.childNodes[0];
                if (node.parentNode) {
                    node.parentNode.replaceChild(docFrag, node);
                }
                return result;
            });
        },
        remove: function () {
            return this.each(function ($n) {
                var node = $n.get();
                if (node.parentNode) node.parentNode.removeChild(node);
            });
        },
        clone: function (events) {
            var n = [];
            this.each(function ($n) {
                var node = $n.get();
                var copy = this._clone(node);
                if (events) copy = this._cloneEvents(node, copy);
                n.push(copy);
            });
            return new Dom(n);
        },
        show: function () {
            return this.each(
                function ($n) {
                    var node = $n.get();
                    if (!node.style || !this._hasDisplayNone(node)) return;
                    var target = node.getAttribute('domTargetShow');
                    node.style.display = target ? target : 'block';
                    node.removeAttribute('domTargetShow');
                }.bind(this)
            );
        },
        hide: function () {
            return this.each(function ($n) {
                var node = $n.get();
                if (!node.style || this._hasDisplayNone(node)) return;
                var display = node.style.display;
                if (display !== 'block') node.setAttribute('domTargetShow', display);
                node.style.display = 'none';
            });
        },
        scrollTop: function (value) {
            var node = this.get();
            var isWindow = this._isWindowNode(node);
            var isDocument = node.nodeType === 9;
            var el = isDocument
                ? node.scrollingElement || node.body.parentNode || node.body || node.documentElement
                : node;
            if (typeof value !== 'undefined') {
                value = parseInt(value);
                if (isWindow) node.scrollTo(0, value);
                else el.scrollTop = value;
                return;
            }
            return isWindow ? node.pageYOffset : el.scrollTop;
        },
        offset: function () {
            return this._getPos('offset');
        },
        position: function () {
            return this._getPos('position');
        },
        width: function (value) {
            return value !== undefined ? this.css('width', parseInt(value) + 'px') : this._getSize('width', 'Width');
        },
        height: function (value) {
            return value !== undefined ? this.css('height', parseInt(value) + 'px') : this._getSize('height', 'Height');
        },
        outerWidth: function () {
            return this._getSize('width', 'Width', 'outer');
        },
        outerHeight: function () {
            return this._getSize('height', 'Height', 'outer');
        },
        innerWidth: function () {
            return this._getSize('width', 'Width', 'inner');
        },
        innerHeight: function () {
            return this._getSize('height', 'Height', 'inner');
        },
        click: function () {
            return this._trigger('click');
        },
        focus: function () {
            return this._trigger('focus');
        },
        blur: function () {
            return this._trigger('blur');
        },
        on: function (names, handler, one) {
            return this.each(function ($n) {
                var node = $n.get();
                var events = names.split(' ');
                for (var i = 0; i < events.length; i++) {
                    var event = this._getEventName(events[i]);
                    var namespace = this._getEventNamespace(events[i]);
                    handler = one ? this._getOneHandler(handler, names) : handler;
                    node.addEventListener(event, handler);
                    node._e = node._e || {};
                    node._e[namespace] = node._e[namespace] || {};
                    node._e[namespace][event] = node._e[namespace][event] || [];
                    node._e[namespace][event].push(handler);
                }
            });
        },
        one: function (events, handler) {
            return this.on(events, handler, true);
        },
        off: function (names, handler) {
            var testEvent = function (name, key, event) {
                return name === event;
            };
            var testNamespace = function (name, key, event, namespace) {
                return key === namespace;
            };
            var testEventNamespace = function (name, key, event, namespace) {
                return name === event && key === namespace;
            };
            var testPositive = function () {
                return true;
            };
            if (names === undefined) {
                return this.each(function ($n) {
                    this._offEvent($n.get(), false, false, handler, testPositive);
                });
            }
            return this.each(function ($n) {
                var node = $n.get();
                var events = names.split(' ');
                for (var i = 0; i < events.length; i++) {
                    var event = this._getEventName(events[i]);
                    var namespace = this._getEventNamespace(events[i]);
                    if (namespace === '_events') this._offEvent(node, event, namespace, handler, testEvent);
                    else if (!event && namespace !== '_events')
                        this._offEvent(node, event, namespace, handler, testNamespace);
                    else this._offEvent(node, event, namespace, handler, testEventNamespace);
                }
            });
        },
        serialize: function (asObject) {
            var obj = {};
            var elms = this.get().elements;
            for (var i = 0; i < elms.length; i++) {
                var el = elms[i];
                if (/(checkbox|radio)/.test(el.type) && !el.checked) continue;
                if (!el.name || el.disabled || el.type === 'file') continue;
                if (el.type === 'select-multiple') {
                    for (var z = 0; z < el.options.length; z++) {
                        var opt = el.options[z];
                        if (opt.selected) obj[el.name] = opt.value;
                    }
                }
                obj[el.name] = this._number(el.value) ? parseFloat(el.value) : this._boolean(el.value);
            }
            return asObject ? obj : this._params(obj);
        },
        scroll: function () {
            this.get().scrollIntoView({
                behavior: 'smooth',
            });
        },
        fadeIn: function (speed, fn) {
            var anim = this._anim(speed, fn, 500);
            return this.each(function ($n) {
                $n.css({
                    display: 'block',
                    opacity: 0,
                    animation: 'fadeIn ' + anim.speed + 's ease-in-out',
                });
                $n.one('animationend', function () {
                    $n.css({
                        opacity: '',
                        animation: '',
                    });
                    if (anim.fn) anim.fn($n);
                });
            });
        },
        fadeOut: function (speed, fn) {
            var anim = this._anim(speed, fn, 300);
            return this.each(function ($n) {
                $n.css({
                    opacity: 1,
                    animation: 'fadeOut ' + anim.speed + 's ease-in-out',
                });
                $n.one('animationend', function () {
                    $n.css({
                        display: 'none',
                        opacity: '',
                        animation: '',
                    });
                    if (anim.fn) anim.fn($n);
                });
            });
        },
        slideUp: function (speed, fn) {
            var anim = this._anim(speed, fn, 300);
            return this.each(function ($n) {
                $n.height($n.height());
                $n.css({
                    overflow: 'hidden',
                    animation: 'slideUp ' + anim.speed + 's ease-out',
                });
                $n.one('animationend', function () {
                    $n.css({
                        display: 'none',
                        height: '',
                        animation: '',
                    });
                    if (anim.fn) anim.fn($n);
                });
            });
        },
        slideDown: function (speed, fn) {
            var anim = this._anim(speed, fn, 400);
            return this.each(function ($n) {
                $n.height($n.height());
                $n.css({
                    display: 'block',
                    overflow: 'hidden',
                    animation: 'slideDown ' + anim.speed + 's ease-in-out',
                });
                $n.one('animationend', function () {
                    $n.css({
                        overflow: '',
                        height: '',
                        animation: '',
                    });
                    if (anim.fn) anim.fn($n);
                });
            });
        },
        _queryContext: function (s, c) {
            c = this._context(c);
            return c.nodeType !== 3 && typeof c.querySelectorAll === 'function' ? c.querySelectorAll(s) : [];
        },
        _query: function (s, c) {
            var d = document;
            if (c) {
                return this._queryContext(s, c);
            } else if (/^[.#]?[\w-]*$/.test(s)) {
                if (s[0] === '#') {
                    var el = d.getElementById(s.slice(1));
                    return el ? [el] : [];
                }
                if (s[0] === '.') {
                    return d.getElementsByClassName(s.slice(1));
                }
                return d.getElementsByTagName(s);
            }
            return d.querySelectorAll(s);
        },
        _context: function (c) {
            return !c ? document : typeof c === 'string' ? document.querySelector(c) : c;
        },
        _sibling: function (s, method) {
            var isNode = s && s.nodeType;
            var sibling;
            this.each(function ($n) {
                var node = $n.get();
                do {
                    node = node[method];
                    if (node && ((isNode && node === s) || new Dom(node).is(s))) {
                        sibling = node;
                        return;
                    }
                } while (node);
            });
            return new Dom(sibling);
        },
        _slice: function (o) {
            return !o || o.length === 0 ? [] : o.length ? [].slice.call(o.nodes || o) : [o];
        },
        _array: function (o) {
            if (o === undefined) return [];
            else if (o instanceof NodeList) {
                var arr = [];
                for (var i = 0; i < o.length; i++) {
                    arr[i] = o[i];
                }
                return arr;
            }
            return o instanceof Dom ? o.nodes : o;
        },
        _object: function (str) {
            return new Function('return ' + str)();
        },
        _params: function (obj) {
            var params = '';
            for (var key in obj) {
                params += '&' + this._encodeUri(key) + '=' + this._encodeUri(obj[key]);
            }
            return params.replace(/^&/, '');
        },
        _boolean: function (str) {
            if (str === 'true') return true;
            else if (str === 'false') return false;
            return str;
        },
        _number: function (str) {
            return !isNaN(str) && !isNaN(parseFloat(str));
        },
        _inject: function (html, fn) {
            var len = this.nodes.length;
            var nodes = [];
            while (len--) {
                var res = typeof html === 'function' ? html.call(this, this.nodes[len]) : html;
                var el = len === 0 ? res : this._clone(res);
                var node = fn.call(this, el, this.nodes[len]);
                if (node) {
                    if (node.dom) nodes.push(node.get());
                    else nodes.push(node);
                }
            }
            return new Dom(nodes);
        },
        _clone: function (node) {
            if (typeof node === 'undefined') return;
            if (typeof node === 'string') return node;
            else if (node instanceof Node || node.nodeType) return node.cloneNode(true);
            else if ('length' in node) {
                return [].map.call(this._array(node), function (el) {
                    return el.cloneNode(true);
                });
            }
        },
        _cloneEvents: function (node, copy) {
            var events = node._e;
            if (events) {
                copy._e = events;
                for (var name in events._events) {
                    for (var i = 0; i < events._events[name].length; i++) {
                        copy.addEventListener(name, events._events[name][i]);
                    }
                }
            }
            return copy;
        },
        _trigger: function (name) {
            var node = this.get();
            if (node && node.nodeType !== 3) node[name]();
            return this;
        },
        _encodeUri: function (str) {
            return encodeURIComponent(str)
                .replace(/!/g, '%21')
                .replace(/'/g, '%27')
                .replace(/\(/g, '%28')
                .replace(/\)/g, '%29')
                .replace(/\*/g, '%2A')
                .replace(/%20/g, '+');
        },
        _getSize: function (name, cname) {
            var el = this.get();
            var value = 0;
            if (el.nodeType === 3) {
                value = 0;
            } else if (el.nodeType === 9) {
                value = this._getDocSize(el, cname);
            } else if (this._isWindowNode(el)) {
                value = window['inner' + cname];
            } else {
                value = this._getHeightOrWidth(name);
            }
            return Math.round(value);
        },
        _getDocSize: function (node, type) {
            var body = node.body,
                html = node.documentElement;
            return Math.max(
                body['scroll' + type],
                body['offset' + type],
                html['client' + type],
                html['scroll' + type],
                html['offset' + type]
            );
        },
        _getPos: function (type) {
            var node = this.get();
            var dim = {
                top: 0,
                left: 0,
            };
            if (node.nodeType === 3 || this._isWindowNode(node) || node.nodeType === 9) {
                return dim;
            } else if (type === 'position') {
                return {
                    top: node.offsetTop,
                    left: node.offsetLeft,
                };
            } else if (type === 'offset') {
                var rect = node.getBoundingClientRect();
                var doc = node.ownerDocument;
                var docElem = doc.documentElement;
                var win = doc.defaultView;
                return {
                    top: rect.top + win.pageYOffset - docElem.clientTop,
                    left: rect.left + win.pageXOffset - docElem.clientLeft,
                };
            }
            return dim;
        },
        _getHeightOrWidth: function (name, type) {
            var cname = name.charAt(0).toUpperCase() + name.slice(1);
            var mode = type ? type : 'offset';
            var result = 0;
            var el = this.get();
            if (!el) {
                return 0;
            }
            var style = getComputedStyle(el, null);
            var $targets = this.parents().filter(function ($n) {
                var node = $n.get();
                return node.nodeType === 1 && getComputedStyle(node, null).display === 'none' ? node : false;
            });
            if (style.display === 'none') $targets.add(el);
            if ($targets.length !== 0) {
                var fixStyle = 'visibility: hidden !important; display: block !important;';
                var tmp = [];
                $targets.each(function ($n) {
                    var thisStyle = $n.attr('style');
                    if (thisStyle !== null) tmp.push(thisStyle);
                    $n.attr('style', thisStyle !== null ? thisStyle + ';' + fixStyle : fixStyle);
                });
                result = el[mode + cname];
                $targets.each(function ($n, i) {
                    if (tmp[i] === undefined) $n.removeAttr('style');
                    else $n.attr('style', tmp[i]);
                });
            } else {
                result = el[mode + cname];
            }
            return result;
        },
        _eachClass: function (value, type) {
            return this.each(function ($n) {
                if (value) {
                    var node = $n.get();
                    var fn = function (name) {
                        if (node.classList) node.classList[type](name);
                    };
                    value.split(' ').forEach(fn);
                }
            });
        },
        _getOneHandler: function (handler, events) {
            var self = this;
            return function () {
                handler.apply(this, arguments);
                self.off(events);
            };
        },
        _getEventNamespace: function (event) {
            var arr = event.split('.');
            var namespace = arr[1] ? arr[1] : '_events';
            return arr[2] ? namespace + arr[2] : namespace;
        },
        _getEventName: function (event) {
            return event.split('.')[0];
        },
        _offEvent: function (node, event, namespace, handler, condition) {
            for (var key in node._e) {
                for (var name in node._e[key]) {
                    if (condition(name, key, event, namespace)) {
                        var handlers = node._e[key][name];
                        for (var i = 0; i < handlers.length; i++) {
                            if (typeof handler !== 'undefined' && handlers[i].toString() !== handler.toString()) {
                                continue;
                            }
                            node.removeEventListener(name, handlers[i]);
                            node._e[key][name].splice(i, 1);
                            if (node._e[key][name].length === 0) delete node._e[key][name];
                            if (Object.keys(node._e[key]).length === 0) delete node._e[key];
                        }
                    }
                }
            }
        },
        _hasDisplayNone: function (el) {
            return (
                el.style.display === 'none' ||
                (el.currentStyle ? el.currentStyle.display : getComputedStyle(el, null).display) === 'none'
            );
        },
        _anim: function (speed, fn, speedDef) {
            if (typeof speed === 'function') {
                fn = speed;
                speed = speedDef;
            } else {
                speed = speed || speedDef;
            }
            return {
                fn: fn,
                speed: speed / 1000,
            };
        },
        _isWindowNode: function (node) {
            return node === window || (node.parent && node.parent === window);
        },
    };
    var arx_uuid = 0;
    var ArticleEditor = function (selector, settings) {
        return ArticleEditorInit(selector, settings);
    };
    var ArticleEditorInit = function (selector, settings) {
        var $elms = $ARX.dom(selector);
        var instance;
        $elms.each(function ($el) {
            instance = $el.dataget($ARX.namespace);
            if (!instance) {
                instance = new App($el, settings, arx_uuid);
                $el.dataset($ARX.namespace, instance);
                $ARX.instances[arx_uuid] = instance;
                arx_uuid++;
            }
        });
        return instance;
    };

    var $ARX = ArticleEditor;
    globalThis.$ARX = $ARX;

    $ARX.dom = function (selector, context) {
        return new Dom(selector, context);
    };
    $ARX.ajax = Ajax;
    $ARX.instances = [];
    $ARX.namespace = 'article-editor';
    $ARX.prefix = 'arx';
    $ARX.version = '2.3.7';
    $ARX.settings = {};
    $ARX.lang = {};
    $ARX._mixins = {};
    $ARX._repository = {};
    $ARX._subscribe = {};
    $ARX.keycodes = {
        BACKSPACE: 8,
        DELETE: 46,
        UP: 38,
        DOWN: 40,
        ENTER: 13,
        SPACE: 32,
        ESC: 27,
        TAB: 9,
        CTRL: 17,
        META: 91,
        SHIFT: 16,
        ALT: 18,
        RIGHT: 39,
        LEFT: 37,
    };
    $ARX.add = function (type, name, obj) {
        if (obj.translations) {
            $ARX.lang = $ARX.extend(true, $ARX.lang, obj.translations);
        }
        if (obj.defaults) {
            var localopts = {};
            localopts[name] = obj.defaults;
            $ARX.opts = $ARX.extend(true, $ARX.opts, localopts);
        }
        if (obj.parser) {
            var opt = {};
            opt[obj.type] = obj.parser;
            $ARX.opts.parser = $ARX.extend({}, true, $ARX.opts.parser, opt);
        }
        if (obj.nested) {
            $ARX.opts.nested.push(obj.type);
        }
        if (type === 'mixin') {
            $ARX._mixins[name] = obj;
        } else {
            if (obj.subscribe) {
                for (var key in obj.subscribe) {
                    var arr = key.split(',');
                    for (var i = 0; i < arr.length; i++) {
                        var ns = arr[i].trim();
                        if (typeof $ARX._subscribe[ns] === 'undefined') $ARX._subscribe[ns] = [];
                        $ARX._subscribe[ns].push({
                            module: name,
                            func: obj.subscribe[key],
                        });
                    }
                }
            }
            var F = function () {};
            F.prototype = obj;
            if (obj.mixins) {
                for (var z = 0; z < obj.mixins.length; z++) {
                    $ARX.inherit(F, $ARX._mixins[obj.mixins[z]]);
                }
            }
            $ARX._repository[name] = {
                type: type,
                proto: F,
                obj: obj,
            };
        }
    };
    $ARX.extend = function () {
        var extended = {};
        var deep = false;
        var i = 0;
        var length = arguments.length;
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i++;
        }
        var merge = function (obj) {
            for (var prop in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]')
                        extended[prop] = $ARX.extend(true, extended[prop], obj[prop]);
                    else extended[prop] = obj[prop];
                }
            }
        };
        for (; i < length; i++) {
            var obj = arguments[i];
            merge(obj);
        }
        return extended;
    };
    $ARX.error = function (exception) {
        throw exception;
    };
    $ARX.inherit = function (current, parent) {
        var F = function () {};
        F.prototype = parent;
        var f = new F();
        for (var prop in current.prototype) {
            if (current.prototype.__lookupGetter__(prop))
                f.__defineGetter__(prop, current.prototype.__lookupGetter__(prop));
            else f[prop] = current.prototype[prop];
        }
        current.prototype = f;
        current.prototype.super = parent;
        return current;
    };
    $ARX.addLang = function (lang, obj) {
        if (typeof $ARX.lang[lang] === 'undefined') $ARX.lang[lang] = {};
        $ARX.lang[lang] = $ARX.extend(true, $ARX.lang[lang], obj);
    };
    ArticleEditor.opts = {
        plugins: [],
        content: false,
        placeholder: false,
        css: false,
        custom: {
            css: false,
            js: false,
        },
        editor: {
            classname: 'entry',
            disabled: false,
            focus: false,
            sync: true,
            drop: true,
            lang: 'en',
            add: 'top',
            addbar: false,
            https: false,
            padding: true,
            markup: 'paragraph',
            mobile: 400,
            enterKey: true,
            scrollTarget: window,
            direction: 'ltr',
            spellcheck: true,
            grammarly: false,
            notranslate: false,
            reloadmarker: true,
            minHeight: '100px',
            maxHeight: false,
            doctype: '<!doctype html>',
        },
        selection: {
            multiple: true,
        },
        control: true,
        source: true,
        image: {
            states: true,
            upload: false,
            url: true,
            select: false,
            name: 'file',
            data: false,
            drop: true,
            multiple: true,
            clipboard: true,
            types: ['image/*'],
            tag: 'figure',
            newtab: false,
            link: true,
            width: false,
        },
        classes: false,
        codemirrorSrc: false,
        codemirror: false,
        state: {
            limit: 100,
        },
        path: {
            title: '## editor.title ##',
            sticky: true,
            stickyMinHeight: 200,
            stickyTopOffset: 0,
        },
        autosave: {
            url: false,
            name: false,
            data: false,
            method: 'post',
        },
        paste: {
            clean: true,
            autoparse: true,
            paragraphize: true,
            plaintext: false,
            linkTarget: false,
            images: true,
            links: true,
            keepStyle: [],
            keepClass: [],
            keepAttrs: ['td', 'th'],
            formTags: ['form', 'input', 'button', 'select', 'textarea', 'legend', 'fieldset'],
            blockTags: [
                'pre',
                'div',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'table',
                'tbody',
                'thead',
                'tfoot',
                'th',
                'tr',
                'td',
                'ul',
                'ol',
                'li',
                'blockquote',
                'p',
                'hr',
                'figure',
                'iframe',
                'figcaption',
                'address',
                'section',
                'header',
                'footer',
                'aside',
                'article',
                'audio',
                'source',
            ],
            inlineTags: [
                'a',
                'svg',
                'img',
                'br',
                'strong',
                'ins',
                'code',
                'del',
                'span',
                'samp',
                'kbd',
                'sup',
                'sub',
                'mark',
                'var',
                'cite',
                'small',
                'b',
                'u',
                'em',
                'i',
                'abbr',
            ],
        },
        clean: {
            comments: false,
            enter: true,
            enterinline: false,
        },
        tab: {
            key: true,
            spaces: false,
        },
        topbar: {
            undoredo: false,
            shortcuts: true,
        },
        toolbar: {
            hide: [],
            sticky: true,
            stickyMinHeight: 200,
            stickyTopOffset: 0,
        },
        buttons: {
            editor: ['add', 'template', 'mobile', 'html'],
            topbar: ['undo', 'redo', 'shortcut'],
            toolbar: false,
            except: false,
            add: false,
            tags: {
                b: ['bold'],
                strong: ['bold'],
                i: ['italic'],
                em: ['italic'],
                del: ['deleted'],
                a: ['link'],
            },
            types: false,
            icons: false,
            hidden: {},
        },
        card: {
            classname: 'card',
            template:
                '<div class="card"><div class="card-head"><h3>Card title</h3></div><div class="card-body"><p>Card body</p></div></div>',
        },
        text: {
            classname: 'arx-text',
        },
        noneditable: {
            classname: 'noneditable',
        },
        embed: {
            responsive: 'embed-responsive',
            script: true,
            checkbox: false,
        },
        code: {
            template: '<pre></pre>',
            spaces: 4,
        },
        line: true,
        layer: {
            template: '<div></div>',
        },
        table: {
            template: '<table><tr><td></td><td></td></tr><tr><td></td><td></td></tr></table>',
        },
        quote: {
            template: '<blockquote><p>Quote...</p><p><cite>Author Attribution</cite></p></blockquote>',
        },
        snippets: false,
        templates: false,
        grid: {
            classname: 'grid',
            classes: '',
            overlay: true,
            offset: {
                left: 0,
                right: 0,
            },
            columns: 12,
            gutter: '1.25rem',
            patterns: {
                '6|6': 'column column-6|column column-6',
                '4|4|4': 'column column-4|column column-4|column column-4',
                '3|3|3|3': 'column column-3|column column-3|column column-3|column column-3',
                '2|2|2|2|2|2':
                    'column column-2|column column-2|column column-2|column column-2|column column-2|column column-2',
                '3|6|3': 'column column-3|column column-6|column column-3',
                '2|8|2': 'column column-2|column column-8|column column-2',
                '5|7': 'column column-5|column column-7',
                '7|5': 'column column-7|column column-5',
                '4|8': 'column column-4|column column-8',
                '8|4': 'column column-8|column column-4',
                '3|9': 'column column-3|column column-9',
                '9|3': 'column column-9|column column-3',
                '2|10': 'column column-2|column column-10',
                '10|2': 'column column-10|column column-2',
                12: 'column column-12',
            },
        },
        link: {
            size: 30,
            nofollow: false,
            target: false,
        },
        addbar: ['paragraph', 'image', 'embed', 'line', 'table', 'snippet', 'quote', 'code', 'grid', 'layer'],
        addbarAdd: [],
        addbarHide: [],
        format: ['p', 'h1', 'h2', 'h3', 'ul', 'ol'],
        formatAdd: false,
        outset: {
            none: 'none',
            left: 'outset-left',
            both: 'outset-both',
            right: 'outset-right',
        },
        align: {
            left: 'align-left',
            center: 'align-center',
            right: 'align-right',
            justify: 'align-justify',
        },
        valign: {
            none: 'none',
            top: 'valign-top',
            middle: 'valign-middle',
            bottom: 'valign-bottom',
        },
        shortcutsRemove: false,
        shortcutsBase: {
            'meta+z': '## shortcuts.meta-z ##',
            'meta+shift+z': '## shortcuts.meta-shift-z ##',
            'meta+a': '## shortcuts.meta-a ##',
            'meta+shift+a': '## shortcuts.meta-shift-a ##',
            'meta+click': '## shortcuts.meta-click ##',
        },
        shortcuts: {
            'ctrl+shift+d, meta+shift+d': {
                title: '## shortcuts.meta-shift-d ##',
                name: 'meta+shift+d',
                command: 'block.duplicate',
            },
            'ctrl+shift+up, meta+shift+up': {
                title: '## shortcuts.meta-shift-up ##',
                name: 'meta+shift+&uarr;',
                command: 'block.moveUp',
            },
            'ctrl+shift+down, meta+shift+down': {
                title: '## shortcuts.meta-shift-down ##',
                name: 'meta+shift+&darr;',
                command: 'block.moveDown',
            },
            'ctrl+shift+m, meta+shift+m': {
                title: '## shortcuts.meta-shift-m ##',
                name: 'meta+shift+m',
                command: 'inline.removeFormat',
            },
            'ctrl+b, meta+b': {
                title: '## shortcuts.meta-b ##',
                name: 'meta+b',
                command: 'inline.set',
                params: {
                    tag: 'b',
                },
            },
            'ctrl+i, meta+i': {
                title: '## shortcuts.meta-i ##',
                name: 'meta+i',
                command: 'inline.set',
                params: {
                    tag: 'i',
                },
            },
            'ctrl+u, meta+u': {
                title: '## shortcuts.meta-u ##',
                name: 'meta+u',
                command: 'inline.set',
                params: {
                    tag: 'u',
                },
            },
            'ctrl+h, meta+h': {
                title: '## shortcuts.meta-h ##',
                name: 'meta+h',
                command: 'inline.set',
                params: {
                    tag: 'sup',
                },
            },
            'ctrl+l, meta+l': {
                title: '## shortcuts.meta-l ##',
                name: 'meta+l',
                command: 'inline.set',
                params: {
                    tag: 'sub',
                },
            },
            'ctrl+alt+0, meta+alt+0': {
                title: '## shortcuts.meta-alt-0 ##',
                name: 'meta+alt+0',
                command: 'block.format',
                params: {
                    tag: 'p',
                },
            },
            'ctrl+alt+1, meta+alt+1': {
                title: '## shortcuts.meta-alt-1 ##',
                name: 'meta+alt+1',
                command: 'block.format',
                params: {
                    tag: 'h1',
                },
            },
            'ctrl+alt+2, meta+alt+2': {
                title: '## shortcuts.meta-alt-2 ##',
                name: 'meta+alt+2',
                command: 'block.format',
                params: {
                    tag: 'h2',
                },
            },
            'ctrl+alt+3, meta+alt+3': {
                title: '## shortcuts.meta-alt-3 ##',
                name: 'meta+alt+3',
                command: 'block.format',
                params: {
                    tag: 'h3',
                },
            },
            'ctrl+alt+4, meta+alt+4': {
                title: '## shortcuts.meta-alt-4 ##',
                name: 'meta+alt+4',
                command: 'block.format',
                params: {
                    tag: 'h4',
                },
            },
            'ctrl+alt+5, meta+alt+5': {
                title: '## shortcuts.meta-alt-5 ##',
                name: 'meta+alt+5',
                command: 'block.format',
                params: {
                    tag: 'h5',
                },
            },
            'ctrl+alt+6, meta+alt+6': {
                title: '## shortcuts.meta-alt-6 ##',
                name: 'meta+alt+6',
                command: 'block.format',
                params: {
                    tag: 'h6',
                },
            },
            'ctrl+shift+7, meta+shift+7': {
                title: '## shortcuts.meta-shift-7 ##',
                name: 'meta+shift+7',
                command: 'block.format',
                params: {
                    tag: 'ol',
                },
            },
            'ctrl+shift+8, meta+shift+8': {
                title: '## shortcuts.meta-shift-8 ##',
                name: 'meta+shift+8',
                command: 'block.format',
                params: {
                    tag: 'ul',
                },
            },
            'ctrl+], meta+]': {
                title: '## shortcuts.meta-indent ##',
                name: 'meta+]',
                command: 'list.indent',
            },
            'ctrl+[, meta+[': {
                title: '## shortcuts.meta-outdent ##',
                name: 'meta+[',
                command: 'list.outdent',
            },
            'ctrl+k, meta+k': {
                title: '## shortcuts.meta-k ##',
                name: 'meta+k',
                command: 'link.format',
            },
        },
        disableMode: false,
        markerChar: '\ufeff',
        containers: {
            main: ['bars', 'editor', 'source', 'statusbar'],
            bars: ['pathbar', 'toolbar'],
        },
        tags: {
            denied: ['font', 'html', 'head', 'link', 'title', 'body', 'meta', 'applet', 'marquee'],
            incode: ['!DOCTYPE', '!doctype', 'html', 'head', 'link', 'title', 'body', 'meta', 'textarea', 'style'],
            form: ['form', 'input', 'button', 'select', 'textarea', 'legend', 'fieldset'],
            inline: [
                'a',
                'svg',
                'span',
                'strong',
                'strike',
                'b',
                'u',
                'em',
                'i',
                'code',
                'del',
                'ins',
                'samp',
                'kbd',
                'sup',
                'sub',
                'mark',
                'var',
                'cite',
                'small',
                'abbr',
            ],
            block: [
                'pre',
                'hr',
                'ul',
                'ol',
                'li',
                'p',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'dl',
                'dt',
                'dd',
                'div',
                'table',
                'tbody',
                'thead',
                'tfoot',
                'tr',
                'th',
                'td',
                'blockquote',
                'output',
                'figcaption',
                'figure',
                'address',
                'main',
                'section',
                'header',
                'footer',
                'aside',
                'article',
                'iframe',
                'audio',
                'source',
            ],
            parser: [
                'pre',
                'hr',
                'ul',
                'ol',
                'dl',
                'p',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'div',
                'table',
                'address',
                'blockquote',
                'figure',
                'main',
                'section',
                'header',
                'footer',
                'aside',
                'article',
                'iframe',
            ],
        },
        bsmodal: false,
        regex: {
            youtube:
                /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/gi,
            vimeo: /(http|https)?:\/\/(?:www.|player.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:\/[a-zA-Z0-9_-]+)?/gi,
            imageurl: /((https?|www)[^\s]+\.)(jpe?g|png|gif)(\?[^\s-]+)?/gi,
            url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z\u00F0-\u02AF0-9()!@:%_+.~#?&//=]*)/gi,
            aurl1: /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim,
            aurl2: /(^|[^\/])(www\.[\S]+(\b|$))/gim,
        },
        addbarExtend: {},
        buttonsObj: {
            undo: {
                title: '## buttons.undo ##',
                command: 'buffer.undo',
            },
            redo: {
                title: '## buttons.redo ##',
                command: 'buffer.redo',
            },
            shortcut: {
                title: '## buttons.shortcuts ##',
                observer: 'shortcut.observe',
                command: 'shortcut.popup',
            },
            template: {
                title: '## buttons.templates ##',
                command: 'template.popup',
                observer: 'template.observe',
            },
            html: {
                title: '## buttons.html ##',
                command: 'source.toggle',
            },
            add: {
                title: '## buttons.add ##',
                command: 'addbar.popup',
            },
            format: {
                title: '## buttons.format ##',
                command: 'format.popup',
            },
            alignment: {
                title: '## buttons.align ##',
                command: 'block.popup',
                observer: 'block.observe',
            },
            bold: {
                title: '## buttons.bold ##',
                command: 'inline.set',
                params: {
                    tag: 'b',
                },
            },
            italic: {
                title: '## buttons.italic ##',
                command: 'inline.set',
                params: {
                    tag: 'i',
                },
            },
            deleted: {
                title: '## buttons.deleted ##',
                command: 'inline.set',
                params: {
                    tag: 'del',
                },
            },
            link: {
                title: '## buttons.link ##',
                command: 'link.popup',
            },
            paragraph: {
                title: '## blocks.paragraph ##',
                command: 'block.add',
            },
            image: {
                title: '## blocks.image ##',
                command: 'image.popup',
                observer: 'image.observe',
            },
            'image-card': {
                title: '## buttons.settings ##',
                command: 'image.editCard',
                observer: 'block.observeCard',
            },
            embed: {
                title: '## blocks.embed ##',
                command: 'embed.popup',
                observer: 'embed.observe',
            },
            line: {
                title: '## blocks.line ##',
                command: 'block.add',
                observer: 'block.observe',
            },
            table: {
                title: '## blocks.table ##',
                command: 'table.add',
                observer: 'table.observe',
            },
            'table-tune': {
                command: 'table.cellSetting',
                title: '## buttons.settings ##',
            },
            snippet: {
                title: '## blocks.snippet ##',
                command: 'snippet.popup',
                observer: 'snippet.observe',
            },
            quote: {
                title: '## blocks.quote ##',
                command: 'block.add',
                observer: 'block.observe',
            },
            text: {
                title: '## blocks.text ##',
                command: 'block.add',
            },
            code: {
                title: '## blocks.code ##',
                command: 'block.add',
                observer: 'block.observe',
            },
            grid: {
                title: '## blocks.grid ##',
                command: 'grid.popup',
                observer: 'grid.observe',
            },
            layer: {
                title: '## blocks.layer ##',
                command: 'block.add',
                observer: 'block.observe',
            },
            card: {
                title: '## blocks.card ##',
                command: 'block.add',
            },
            trash: {
                title: '## buttons.delete ##',
                command: 'block.remove',
            },
            duplicate: {
                title: '## buttons.duplicate ##',
                command: 'block.duplicate',
            },
            outset: {
                title: '## buttons.outset ##',
                command: 'block.popup',
                observer: 'block.observe',
            },
            valign: {
                title: '## buttons.valign ##',
                command: 'block.popup',
                observer: 'block.observe',
            },
            outdent: {
                title: '## buttons.outdent ##',
                command: 'list.outdent',
            },
            indent: {
                title: '## buttons.indent ##',
                command: 'list.indent',
            },
        },
        nested: [],
        parser: {},
        parserTags: [],
        formatObj: {
            p: {
                title: '## blocks.paragraph ##',
                type: 'paragraph',
                shortcut: 'Ctrl+Alt+0',
            },
            div: {
                title: '## blocks.text ##',
                type: 'text',
            },
            h1: {
                title: '<span style="font-size: 20px; font-weight: bold;">## headings.h1 ##</span>',
                type: 'heading',
                shortcut: 'Ctrl+Alt+1',
            },
            h2: {
                title: '<span style="font-size: 16px; font-weight: bold;">## headings.h2 ##</span>',
                type: 'heading',
                shortcut: 'Ctrl+Alt+2',
            },
            h3: {
                title: '<span style="font-weight: bold;">## headings.h3 ##</span>',
                type: 'heading',
                shortcut: 'Ctrl+Alt+3',
            },
            h4: {
                title: '<span style="font-weight: bold;">## headings.h4 ##</span>',
                type: 'heading',
                shortcut: 'Ctrl+Alt+4',
            },
            h5: {
                title: '<span style="font-weight: bold;">## headings.h5 ##</span>',
                type: 'heading',
                shortcut: 'Ctrl+Alt+5',
            },
            h6: {
                title: '<span style="font-weight: bold;">## headings.h6 ##</span>',
                type: 'heading',
                shortcut: 'Ctrl+Alt+6',
            },
            ol: {
                title: '1. ## list.ordered-list ##',
                type: 'list',
                shortcut: 'Ctrl+Shift+7',
            },
            ul: {
                title: '&bull; ## list.unordered-list ##',
                type: 'list',
                shortcut: 'Ctrl+Shift+8',
            },
            dl: {
                title: '## blocks.dlist ##',
                type: 'dlist',
            },
            address: {
                title: '<em>## blocks.address ##</em>',
                type: 'address',
            },
        },
    };
    ArticleEditor.lang['en'] = {
        accessibility: {
            'help-label': 'Rich text editor',
        },
        editor: {
            title: 'Article',
            multiple: 'Multiple',
        },
        placeholders: {
            figcaption: 'Type caption (optional)',
            text: 'Type something...',
            code: 'Edit to add code...',
            layer: 'Press enter to add a new text...',
        },
        popup: {
            link: 'Link',
            add: 'Add',
            grid: 'Grid',
            back: 'Back',
            image: 'Image',
            snippets: 'Snippets',
            'add-image': 'Add Image',
        },
        shortcuts: {
            'meta-a': 'Select text in the block',
            'meta-shift-a': 'Select all blocks',
            'meta-click': 'Select multiple blocks',
            'meta-z': 'Undo',
            'meta-shift-z': 'Redo',
            'meta-shift-m': 'Remove inline format',
            'meta-b': 'Bold',
            'meta-i': 'Italic',
            'meta-u': 'Underline',
            'meta-h': 'Superscript',
            'meta-l': 'Subscript',
            'meta-k': 'Link',
            'meta-alt-0': 'Normal text',
            'meta-alt-1': 'Heading 1',
            'meta-alt-2': 'Heading 2',
            'meta-alt-3': 'Heading 3',
            'meta-alt-4': 'Heading 4',
            'meta-alt-5': 'Heading 5',
            'meta-alt-6': 'Heading 6',
            'meta-shift-7': 'Ordered List',
            'meta-shift-8': 'Unordered List',
            'meta-indent': 'Indent',
            'meta-outdent': 'Outdent',
            'meta-shift-backspace': 'Delete block',
            'meta-shift-d': 'Duplicate block',
            'meta-shift-up': 'Move line up',
            'meta-shift-down': 'Move line down',
        },
        headings: {
            h1: 'Heading 1',
            h2: 'Heading 2',
            h3: 'Heading 3',
            h4: 'Heading 4',
            h5: 'Heading 5',
            h6: 'Heading 6',
        },
        inline: {
            bold: 'Bold',
            italic: 'Italic',
            deleted: 'Deleted',
        },
        list: {
            'unordered-list': 'Unordered List',
            'ordered-list': 'Ordered List',
            indent: 'Indent',
            outdent: 'Outdent',
        },
        link: {
            link: 'Link',
            'edit-link': 'Edit link',
            unlink: 'Unlink',
            'link-in-new-tab': 'Open link in new tab',
            save: 'Save',
            insert: 'Insert',
            cancel: 'Cancel',
            text: 'Text',
            url: 'URL',
        },
        table: {
            width: 'Width',
            nowrap: 'Nowrap',
            save: 'Save',
            cancel: 'Cancel',
            'table-cell': 'Table Cell',
            'add-head': 'Add head',
            'remove-head': 'Remove head',
            'add-row-below': 'Add row below',
            'add-row-above': 'Add row above',
            'remove-row': 'Remove row',
            'add-column-after': 'Add column after',
            'add-column-before': 'Add column before',
            'remove-column': 'Remove column',
        },
        image: {
            or: 'or',
            'alt-text': 'Alt Text',
            save: 'Save',
            link: 'Link',
            width: 'Width',
            delete: 'Delete',
            cancel: 'Cancel',
            insert: 'Insert',
            caption: 'Caption',
            'link-in-new-tab': 'Open link in new tab',
            'url-placeholder': 'Paste url of image...',
            'upload-new-placeholder': 'Drag to upload a new image<br>or click to select',
        },
        code: {
            code: 'Code',
            insert: 'Insert',
            save: 'Save',
            cancel: 'Cancel',
        },
        embed: {
            embed: 'Embed',
            caption: 'Caption',
            insert: 'Insert',
            save: 'Save',
            cancel: 'Cancel',
            description: 'Paste any embed/html code or enter the url (vimeo or youtube video only)',
            'responsive-video': 'Responsive video',
        },
        upload: {
            placeholder: 'Drag to upload <br>or click to select',
        },
        templates: {
            templates: 'Templates',
        },
        snippets: {
            snippets: 'Snippets',
        },
        form: {
            link: 'Link',
            url: 'Url',
            text: 'Text',
            name: 'Name',
            'alt-text': 'Alt Text',
            image: 'Image',
            upload: 'Upload',
            alignment: 'Alignment',
            outset: 'Outset',
            valign: 'Valign',
        },
        buttons: {
            'mobile-view': 'Mobile View',
            cancel: 'Cancel',
            insert: 'Insert',
            unlink: 'Unlink',
            save: 'Save',
            add: 'Add',
            'transform-to-text': 'Transform to text',
            align: 'Alignment',
            valign: 'Valign',
            outset: 'Outset',
            indent: 'Indent',
            outdent: 'Outdent',
            head: 'Head',
            row: 'Row',
            cell: 'Cell',
            html: 'HTML',
            templates: 'Templates',
            shortcuts: 'Keyboard Shortcuts',
            format: 'Format',
            bold: 'Bold',
            italic: 'Italic',
            deleted: 'Deleted',
            underline: 'Underline',
            table: 'Table',
            link: 'Link',
            undo: 'Undo',
            redo: 'Redo',
            style: 'Style',
            config: 'Config',
            settings: 'Settings',
            text: 'Text',
            embed: 'Embed',
            grid: 'Grid',
            image: 'Image',
            list: 'List',
            delete: 'Delete',
            duplicate: 'Duplicate',
            sort: 'Sort',
            edit: 'Edit',
            inline: 'Inline',
        },
        blocks: {
            noneditable: 'Noneditable',
            paragraph: 'Paragraph',
            heading: 'Heading',
            image: 'Image',
            figcaption: 'Figcaption',
            embed: 'Embed',
            line: 'Line',
            code: 'Code',
            quote: 'Quote',
            quoteitem: 'Paragraph',
            snippet: 'Snippet',
            column: 'Column',
            grid: 'Grid',
            list: 'List',
            table: 'Table',
            layer: 'Layer',
            row: 'Row',
            text: 'Text',
            cell: 'Cell',
            dlist: 'Definition List',
            address: 'Address',
            form: 'Form',
            card: 'Card',
        },
    };
    var App = function ($element, settings, uuid) {
        var maps = ['keycodes', 'prefix', 'dom', 'ajax', '_repository', '_subscribe'];
        for (var i = 0; i < maps.length; i++) {
            this[maps[i]] = $ARX[maps[i]];
        }
        this.uuid = uuid;
        this.$win = this.dom(window);
        this.$doc = this.dom(document);
        this.$body = this.dom('body');
        this.$element = $element;
        this.app = this;
        this.initialSettings = settings;
        this._initer = ['setting', 'lang'];
        this._priority = ['container', 'editor', 'accessibility', 'state'];
        this._plugins = [];
        this.started = false;
        this.start();
    };
    App.prototype = {
        start: function (settings) {
            if (!this.isTextarea()) return;
            if (this.isStarted()) return;
            if (settings) this.initialSettings = settings;
            this._initCore();
            this._plugins = this.setting.get('plugins');
            this.broadcast('app.before.start');
            this._initModules();
            this._initPlugins();
            this._startPriority();
            this._startModules();
            this._startPlugins();
            this.started = true;
            this.broadcast('app.start');
            this._loadModulesAndPlugins();
            if (this.opts.disableMode !== false) {
                this.disable();
            }
        },
        isStarted: function () {
            return this.started;
        },
        isTextarea: function () {
            return this.$element.get().tagName === 'TEXTAREA';
        },
        stop: function () {
            if (this.isStopped()) return;
            this.broadcast('app.before.stop');
            this._stopPlugins();
            this._stopPriority();
            this._stopModules();
            this.started = false;
            this.broadcast('app.stop');
        },
        isStopped: function () {
            return !this.started;
        },
        destroy: function () {
            clearTimeout(this.app.sync.typingTimer);
            this.stop();
            this.broadcast('app.destroy');
            this.$element.dataset($ARX.namespace, false);
            var index = $ARX.instances.indexOf(this.uuid);
            if (index > -1) {
                $ARX.instances.splice(index, 1);
            }
        },
        disable: function () {
            this.block.unset();
            this.blocks.unset();
            this.selection.removeAllRanges();
            if (this.source.is()) {
                this.source.close();
            }
            this.popup.close(false);
            this.toolbar.disableSticky();
            this.toolbar.disable();
            this.path.disable();
            this.topbar.disable();
            this.editor.getOverlay().addClass(this.prefix + '-editor-disabled');
            this.opts.disableMode = true;
        },
        enable: function () {
            this.toolbar.enableSticky();
            this.toolbar.enable();
            this.path.enable();
            this.topbar.enable();
            this.editor.getOverlay().removeClass(this.prefix + '-editor-disabled');
            this.opts.disableMode = false;
        },
        broadcast: function (name, params) {
            var event = params instanceof App.Event ? params : new App.Event(name, params);
            if (typeof this._subscribe[name] !== 'undefined') {
                var events = this._subscribe[name];
                for (var i = 0; i < events.length; i++) {
                    var instance = this[events[i].module];
                    if (instance) {
                        events[i].func.call(instance, event);
                    }
                }
            }
            var callbacks = this.setting.has('subscribe') ? this.setting.get('subscribe') : {};
            if (typeof callbacks[name] === 'function') {
                callbacks[name].call(this, event);
            }
            return event;
        },
        broadcastParams: function (name, params) {
            var event = this.broadcast(name, params);
            return event.getAll();
        },
        broadcastHtml: function (name, html) {
            var event = this.broadcast(name, {
                html: html,
            });
            return event.get('html');
        },
        create: function (name) {
            if (typeof this._repository[name] === 'undefined') {
                $ARX.error('The class "' + name + '" does not exist.');
            }
            var args = [].slice.call(arguments, 1);
            var instance = new this._repository[name].proto();
            instance._name = name;
            instance.app = this;
            var maps = ['uuid', 'prefix', 'dom', 'ajax'];
            for (var i = 0; i < maps.length; i++) {
                instance[maps[i]] = this[maps[i]];
            }
            if (this.lang) instance.lang = this.lang;
            if (this.opts) instance.opts = this.opts;
            var result;
            if (instance.init) {
                result = instance.init.apply(instance, args);
            }
            return result ? result : instance;
        },
        api: function (name) {
            var args = [].slice.call(arguments, 1);
            var namespaces = name.split('.');
            var func = namespaces.pop();
            var context = this;
            for (var i = 0; i < namespaces.length; i++) {
                context = context[namespaces[i]];
            }
            if (context && typeof context[func] === 'function') {
                return context[func].apply(context, args);
            }
        },
        _initCore: function () {
            for (var i = 0; i < this._initer.length; i++) {
                this[this._initer[i]] = this.create(this._initer[i]);
            }
            if (this.setting) {
                this.opts = this.setting.dump();
            }
        },
        _initModules: function () {
            for (var key in this._repository) {
                if (this._repository[key].type === 'module' && this._initer.indexOf(key) === -1) {
                    this[key] = this.create(key);
                }
            }
        },
        _initPlugins: function () {
            var plugins = this.setting.get('plugins');
            for (var key in this._repository) {
                if (this._repository[key].type === 'plugin' && plugins.indexOf(key) !== -1) {
                    this[key] = this.create(key);
                }
            }
        },
        _startPriority: function () {
            for (var i = 0; i < this._priority.length; i++) {
                this._call(this[this._priority[i]], 'start');
            }
        },
        _startModules: function () {
            this._iterate('module', 'start');
        },
        _startPlugins: function () {
            this._iterate('plugin', 'start');
        },
        _stopPriority: function () {
            var priority = this._priority.slice().reverse();
            for (var i = 0; i < priority.length; i++) {
                this._call(this[priority[i]], 'stop');
            }
        },
        _stopModules: function () {
            this._iterate('module', 'stop');
        },
        _stopPlugins: function () {
            this._iterate('plugin', 'stop');
        },
        _loadModulesAndPlugins: function () {
            this._iterate('module', 'load');
            this._iterate('plugin', 'load');
        },
        _iterate: function (type, method) {
            for (var key in this._repository) {
                var isIn =
                    type === 'module'
                        ? method === 'load' || this._priority.indexOf(key) === -1
                        : this._plugins.indexOf(key) !== -1;
                if (this._repository[key].type === type && isIn) {
                    this._call(this[key], method);
                }
            }
        },
        _call: function (instance, method) {
            if (typeof instance[method] === 'function') {
                instance[method].apply(instance);
            }
        },
    };
    App.Event = function (name, params) {
        this.name = name;
        this.params = typeof params === 'undefined' ? {} : params;
        this.stopped = false;
    };
    App.Event.prototype = {
        is: function (name) {
            if (Array.isArray(name)) {
                for (var i = 0; i < name.length; i++) {
                    if (this.params[name[i]]) {
                        return true;
                    }
                }
            } else {
                return this.get(name);
            }
        },
        has: function (name) {
            return typeof this.params[name] !== 'undefined';
        },
        getAll: function () {
            return this.params;
        },
        get: function (name) {
            return this.params[name];
        },
        set: function (name, value) {
            this.params[name] = value;
        },
        stop: function () {
            this.stopped = true;
        },
        isStopped: function () {
            return this.stopped;
        },
    };
    ArticleEditor.add('mixin', 'block', allImports.blockMixin);
    ArticleEditor.add('mixin', 'tool', allImports.toolMixin);
    ArticleEditor.add('module', 'lang', allImports.langModule);
    ArticleEditor.add('module', 'setting', allImports.settingModule);
    ArticleEditor.add('module', 'container', allImports.containerModule);
    ArticleEditor.add('module', 'accessibility', allImports.accessibilityModule);
    ArticleEditor.add('module', 'utils', allImports.utilsModule);
    ArticleEditor.add('module', 'paragraphizer', allImports.paragraphizerModule);
    ArticleEditor.add('module', 'element', allImports.elementModule);
    ArticleEditor.add('module', 'scroll', allImports.scrollModule);
    ArticleEditor.add('module', 'button', allImports.buttonModule);
    ArticleEditor.add('module', 'tooltip', allImports.tooltipModule);
    ArticleEditor.add('module', 'fragment', allImports.fragmentModule);
    ArticleEditor.add('module', 'clipboard', allImports.clipboardModule);
    ArticleEditor.add('module', 'codemirror', allImports.codemirrorModule);
    ArticleEditor.add('class', 'upload', allImports.uploadClass);
    ArticleEditor.add('module', 'progress', allImports.progressModule);
    ArticleEditor.add('module', 'autosave', allImports.autosaveModule);
    ArticleEditor.add('module', 'statusbar', allImports.statusbarModule);
    ArticleEditor.add('module', 'shortcut', allImports.shortcutModule);
    ArticleEditor.add('module', 'offset', allImports.offsetModule);
    ArticleEditor.add('module', 'marker', allImports.markerModule);
    ArticleEditor.add('module', 'state', allImports.stateModule);
    ArticleEditor.add('module', 'sync', allImports.syncModule);
    ArticleEditor.add('module', 'placeholder', allImports.placeholderModule);
    ArticleEditor.add('module', 'list', allImports.listModule);
    ArticleEditor.add('module', 'cleaner', allImports.cleanerModule);
    ArticleEditor.add('module', 'tidy', allImports.tidyModule);
    ArticleEditor.add('module', 'source', allImports.sourceModule);
    ArticleEditor.add('module', 'content', allImports.contentModule);
    ArticleEditor.add('module', 'autoparse', allImports.autoparseModule);
    ArticleEditor.add('module', 'caret', allImports.caretModule);
    ArticleEditor.add('module', 'selection', allImports.selectionModule);
    ArticleEditor.add('module', 'inline', allImports.inlineModule);
    ArticleEditor.add('module', 'popup', allImports.popupModule);
    ArticleEditor.add('class', 'popup.item', allImports.popupItemClass);
    ArticleEditor.add('class', 'popup.stack', allImports.popupStackClass);
    ArticleEditor.add('class', 'popup.header', allImports.popupHeaderClass);
    ArticleEditor.add('class', 'popup.button', allImports.popupButtonClass);
    ArticleEditor.add('module', 'editor', allImports.editorModule);
    ArticleEditor.add('module', 'observer', allImports.observerModule);
    ArticleEditor.add('module', 'parser', allImports.parserModule);
    ArticleEditor.add('module', 'blocks', allImports.blocksModule);
    ArticleEditor.add('module', 'block', allImports.blockModule);
    ArticleEditor.add('module', 'event', allImports.eventModule);
    ArticleEditor.add('module', 'input', allImports.inputModule);
    ArticleEditor.add('module', 'toolbar', allImports.toolbarModule);
    ArticleEditor.add('module', 'path', allImports.pathModule);
    ArticleEditor.add('module', 'topbar', allImports.topbarModule);
    ArticleEditor.add('module', 'control', allImports.controlModule);
    ArticleEditor.add('module', 'insertion', allImports.insertionModule);
    ArticleEditor.add('module', 'addbar', allImports.addbarModule);
    ArticleEditor.add('module', 'format', allImports.formatModule);
    ArticleEditor.add('module', 'link', allImports.linkModule);
    ArticleEditor.add('module', 'embed', allImports.embedModule);
    ArticleEditor.add('module', 'grid', allImports.gridModule);
    ArticleEditor.add('module', 'image', allImports.imageModule);
    ArticleEditor.add('module', 'table', allImports.tableModule);
    ArticleEditor.add('module', 'snippet', allImports.snippetModule);
    ArticleEditor.add('module', 'template', allImports.templateModule);
    ArticleEditor.add('class', 'tool.checkbox', allImports.toolCheckboxClass);
    ArticleEditor.add('class', 'tool.input', allImports.toolInputClass);
    ArticleEditor.add('class', 'tool.number', allImports.toolNumberClass);
    ArticleEditor.add('class', 'tool.segment', allImports.toolSegmentClass);
    ArticleEditor.add('class', 'tool.select', allImports.toolSelectClass);
    ArticleEditor.add('class', 'tool.textarea', allImports.toolTextareaClass);
    ArticleEditor.add('class', 'tool.upload', allImports.toolUploadClass);
    ArticleEditor.add('block', 'block.paragraph', allImports.blockParagraphBlock);
    ArticleEditor.add('block', 'block.text', allImports.blockTextBlock);
    ArticleEditor.add('block', 'block.address', allImports.blockAddressBlock);
    ArticleEditor.add('block', 'block.cell', allImports.blockCellBlock);
    ArticleEditor.add('block', 'block.code', allImports.blockCodeBlock);
    ArticleEditor.add('block', 'block.column', allImports.blockColumnBlock);
    ArticleEditor.add('block', 'block.dlist', allImports.blockDlistBlock);
    ArticleEditor.add('block', 'block.embed', allImports.blockEmbedBlock);
    ArticleEditor.add('block', 'block.figcaption', allImports.blockFigcaptionBlock);
    ArticleEditor.add('block', 'block.grid', allImports.blockGridBlock);
    ArticleEditor.add('block', 'block.heading', allImports.blockHeadingBlock);
    ArticleEditor.add('block', 'block.image', allImports.blockImageBlock);
    ArticleEditor.add('block', 'block.layer', allImports.blockLayerBlock);
    ArticleEditor.add('block', 'block.line', allImports.blockLineBlock);
    ArticleEditor.add('block', 'block.list', allImports.blockListBlock);
    ArticleEditor.add('block', 'block.noneditable', allImports.blockNoneditableBlock);
    ArticleEditor.add('block', 'block.quote', allImports.blockQuoteBlock);
    ArticleEditor.add('block', 'block.quoteitem', allImports.blockQuoteitemBlock);
    ArticleEditor.add('block', 'block.row', allImports.blockRowBlock);
    ArticleEditor.add('block', 'block.table', allImports.blockTableBlock);
    ArticleEditor.add('block', 'block.variable', allImports.blockVariableBlock);
    ArticleEditor.add('block', 'block.form', allImports.blockFormBlock);
    ArticleEditor.add('block', 'block.card', allImports.blockCardBlock);
    window.ArticleEditor = ArticleEditor;
    window.addEventListener('load', function () {
        ArticleEditor('[data-article-editor]');
    });
    if (typeof module === 'object' && module.exports) {
        module.exports = ArticleEditor;
        module.exports.ArticleEditor = ArticleEditor;
    }
})();
