
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.19.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\button.svelte generated by Svelte v3.19.1 */
    const file = "src\\components\\button.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(div0, "class", "buttonlabel svelte-zgimuc");
    			add_location(div0, file, 67, 3, 1233);
    			attr_dev(div1, "class", "button svelte-zgimuc");
    			attr_dev(div1, "id", "btnIndex");
    			add_location(div1, file, 66, 1, 1177);
    			attr_dev(div2, "class", "container svelte-zgimuc");
    			add_location(div2, file, 65, 0, 1151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    			dispose = listen_dev(div1, "click", /*click*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { text = "" } = $$props;

    	function click() {
    		dispatch("click");
    	}

    	const writable_props = ["text"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Button> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		text,
    		click
    	});

    	$$self.$inject_state = $$props => {
    		if ("text" in $$props) $$invalidate(0, text = $$props.text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [text, click];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { text: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get text() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\file_select.svelte generated by Svelte v3.19.1 */

    function create_fragment$1(ctx) {
    	let current;

    	const button = new Button({
    			props: { text: "Selectionner un fichier" },
    			$$inline: true
    		});

    	button.$on("click", /*openFileChoser*/ ctx[0]);

    	const block = {
    		c: function create() {
    			create_component(button.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	const { dialog } = require("electron").remote;
    	const dispatch = createEventDispatcher();
    	let file_path;

    	function openFileChoser() {
    		file_path = dialog.showOpenDialogSync(undefined, {
    			filters: [{ name: "Fichier MP3", extensions: ["mp3"] }]
    		});

    		dispatch("file", file_path[0]);
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		onMount,
    		dialog,
    		Button,
    		dispatch,
    		file_path,
    		openFileChoser,
    		require,
    		undefined
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_path" in $$props) file_path = $$props.file_path;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [openFileChoser];
    }

    class File_select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File_select",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\components\text.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\components\\text.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(/*placeholder*/ ctx[1]);
    			attr_dev(input, "class", "floating-input svelte-1jmm2aw");
    			attr_dev(input, "type", /*type*/ ctx[3]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			input.value = /*value*/ ctx[0];
    			add_location(input, file$1, 106, 4, 2587);
    			attr_dev(label, "for", /*name*/ ctx[2]);
    			attr_dev(label, "class", "svelte-1jmm2aw");
    			add_location(label, file$1, 107, 4, 2682);
    			attr_dev(div, "class", "floating-label svelte-1jmm2aw");
    			add_location(div, file$1, 105, 0, 2553);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);
    			dispose = listen_dev(input, "input", /*handleInput*/ ctx[4], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*type*/ 8) {
    				attr_dev(input, "type", /*type*/ ctx[3]);
    			}

    			if (dirty & /*placeholder*/ 2) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				prop_dev(input, "value", /*value*/ ctx[0]);
    			}

    			if (dirty & /*placeholder*/ 2) set_data_dev(t1, /*placeholder*/ ctx[1]);

    			if (dirty & /*name*/ 4) {
    				attr_dev(label, "for", /*name*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { placeholder = "" } = $$props;
    	let { value = "" } = $$props;
    	let { name } = $$props;
    	let { type = "text" } = $$props;

    	const handleInput = e => {
    		$$invalidate(0, value = type.match(/^(number|range)$/)
    		? +e.target.value
    		: e.target.value);
    	};

    	const writable_props = ["placeholder", "value", "name", "type"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Text> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    	};

    	$$self.$capture_state = () => ({
    		placeholder,
    		value,
    		name,
    		type,
    		handleInput
    	});

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(1, placeholder = $$props.placeholder);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("type" in $$props) $$invalidate(3, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, placeholder, name, type, handleInput];
    }

    class Text extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			placeholder: 1,
    			value: 0,
    			name: 2,
    			type: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
    			console.warn("<Text> was created without expected prop 'name'");
    		}
    	}

    	get placeholder() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Text>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Text>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\cover.svelte generated by Svelte v3.19.1 */

    const file$2 = "src\\components\\cover.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*img_url*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Cover");
    			attr_dev(img, "class", "svelte-1ec5dev");
    			add_location(img, file$2, 50, 1, 1088);
    			attr_dev(div, "id", "editable");
    			set_style(div, "--size", /*size*/ ctx[0]);
    			attr_dev(div, "class", "svelte-1ec5dev");
    			add_location(div, file$2, 49, 0, 1021);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			dispose = listen_dev(div, "click", /*editCover*/ ctx[2], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*img_url*/ 2 && img.src !== (img_src_value = /*img_url*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*size*/ 1) {
    				set_style(div, "--size", /*size*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { image } = $$props;
    	let { image_mime } = $$props;
    	let { size = "250px" } = $$props;
    	const nativeImage = require("electron").nativeImage;
    	const { dialog } = require("electron").remote;
    	let img_url;

    	if (image != undefined) {
    		img_url = nativeImage.createFromBuffer(image).toDataURL();
    	} else {
    		img_url = nativeImage.createEmpty().toDataURL();
    	}

    	function editCover() {
    		let new_image_path = dialog.showOpenDialogSync(undefined, {
    			filters: [
    				{
    					name: "Image",
    					extensions: ["png", "jpg"]
    				}
    			]
    		});

    		if (new_image_path != undefined) {
    			let native = nativeImage.createFromPath(new_image_path[0]);
    			$$invalidate(3, image = Buffer.from(native.toJPEG(100)));
    			$$invalidate(4, image_mime = "jpeg");
    			$$invalidate(1, img_url = native.toDataURL());
    		}
    	}

    	const writable_props = ["image", "image_mime", "size"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Cover> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("image" in $$props) $$invalidate(3, image = $$props.image);
    		if ("image_mime" in $$props) $$invalidate(4, image_mime = $$props.image_mime);
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    	};

    	$$self.$capture_state = () => ({
    		image,
    		image_mime,
    		size,
    		nativeImage,
    		dialog,
    		img_url,
    		editCover,
    		require,
    		undefined,
    		Buffer
    	});

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(3, image = $$props.image);
    		if ("image_mime" in $$props) $$invalidate(4, image_mime = $$props.image_mime);
    		if ("size" in $$props) $$invalidate(0, size = $$props.size);
    		if ("img_url" in $$props) $$invalidate(1, img_url = $$props.img_url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, img_url, editCover, image, image_mime];
    }

    class Cover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { image: 3, image_mime: 4, size: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cover",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[3] === undefined && !("image" in props)) {
    			console.warn("<Cover> was created without expected prop 'image'");
    		}

    		if (/*image_mime*/ ctx[4] === undefined && !("image_mime" in props)) {
    			console.warn("<Cover> was created without expected prop 'image_mime'");
    		}
    	}

    	get image() {
    		throw new Error("<Cover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image(value) {
    		throw new Error("<Cover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get image_mime() {
    		throw new Error("<Cover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set image_mime(value) {
    		throw new Error("<Cover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Cover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Cover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\hms.svelte generated by Svelte v3.19.1 */
    const file$3 = "src\\components\\hms.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let input;
    	let t0;
    	let label;
    	let t1;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			label = element("label");
    			t1 = text(/*placeholder*/ ctx[0]);
    			attr_dev(input, "class", "floating-input svelte-1x1xamt");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			attr_dev(input, "name", /*name*/ ctx[1]);
    			toggle_class(input, "error", /*input_error*/ ctx[3]);
    			add_location(input, file$3, 156, 4, 3741);
    			attr_dev(label, "for", /*name*/ ctx[1]);
    			attr_dev(label, "class", "svelte-1x1xamt");
    			add_location(label, file$3, 157, 4, 3878);
    			attr_dev(div, "class", "floating-label svelte-1x1xamt");
    			add_location(div, file$3, 155, 0, 3707);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*value*/ ctx[2]);
    			append_dev(div, t0);
    			append_dev(div, label);
    			append_dev(label, t1);

    			dispose = [
    				listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    				listen_dev(input, "input", /*handleInput*/ ctx[4], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			}

    			if (dirty & /*name*/ 2) {
    				attr_dev(input, "name", /*name*/ ctx[1]);
    			}

    			if (dirty & /*value*/ 4 && input.value !== /*value*/ ctx[2]) {
    				set_input_value(input, /*value*/ ctx[2]);
    			}

    			if (dirty & /*input_error*/ 8) {
    				toggle_class(input, "error", /*input_error*/ ctx[3]);
    			}

    			if (dirty & /*placeholder*/ 1) set_data_dev(t1, /*placeholder*/ ctx[0]);

    			if (dirty & /*name*/ 2) {
    				attr_dev(label, "for", /*name*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function fromHMS(str) {
    	let tab = str.split(":");
    	let nb_ms = (parseInt(tab[0]) * 3600 + parseInt(tab[1]) * 60 + parseInt(tab[2])) * 1000;
    	return nb_ms >= 1 ? nb_ms : 1;
    }

    function toHMS(pMs) {
    	let nbSec = Math.round(pMs / 1000);
    	let sortie = {};
    	sortie.heure = Math.trunc(nbSec / 3600);

    	if (sortie.heure < 10) {
    		sortie.heure = "0" + sortie.heure;
    	}

    	nbSec = nbSec % 3600;
    	sortie.minute = Math.trunc(nbSec / 60);

    	if (sortie.minute < 10) {
    		sortie.minute = "0" + sortie.minute;
    	}

    	nbSec = nbSec % 60;
    	sortie.seconde = Math.trunc(nbSec);

    	if (sortie.seconde < 10) {
    		sortie.seconde = "0" + sortie.seconde;
    	}

    	let sortie_chaine = sortie.heure + ":" + sortie.minute + ":" + sortie.seconde;
    	return sortie_chaine;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { placeholder = "" } = $$props;
    	let { ms = 0 } = $$props;
    	let { name } = $$props;
    	let value = "00:00:00";
    	let input_error = false;

    	const handleInput = e => {
    		if (value.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/) == null) {
    			$$invalidate(3, input_error = true);
    		} else {
    			$$invalidate(3, input_error = false);
    			$$invalidate(5, ms = fromHMS(value));
    		}
    	};

    	onMount(() => {
    		$$invalidate(2, value = toHMS(ms));
    	});

    	const writable_props = ["placeholder", "ms", "name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Hms> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(2, value);
    	}

    	$$self.$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("ms" in $$props) $$invalidate(5, ms = $$props.ms);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		placeholder,
    		ms,
    		name,
    		value,
    		input_error,
    		handleInput,
    		fromHMS,
    		toHMS,
    		parseInt,
    		Math
    	});

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("ms" in $$props) $$invalidate(5, ms = $$props.ms);
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("input_error" in $$props) $$invalidate(3, input_error = $$props.input_error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [placeholder, name, value, input_error, handleInput, ms, input_input_handler];
    }

    class Hms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { placeholder: 0, ms: 5, name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Hms",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[1] === undefined && !("name" in props)) {
    			console.warn("<Hms> was created without expected prop 'name'");
    		}
    	}

    	get placeholder() {
    		throw new Error("<Hms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Hms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get ms() {
    		throw new Error("<Hms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set ms(value) {
    		throw new Error("<Hms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Hms>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Hms>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\chapter_editor.svelte generated by Svelte v3.19.1 */
    const file$4 = "src\\pages\\chapter_editor.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[37] = list[i];
    	child_ctx[38] = list;
    	child_ctx[39] = i;
    	return child_ctx;
    }

    // (249:1) {#each chapter_list as chap, index (chap.elementID)}
    function create_each_block(key_1, ctx) {
    	let div3;
    	let div1;
    	let updating_image;
    	let updating_image_mime;
    	let t0;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let img2;
    	let img2_src_value;
    	let div0_index_chap_value;
    	let t3;
    	let div2;
    	let updating_value;
    	let t4;
    	let updating_ms;
    	let t5;
    	let updating_ms_1;
    	let t6;
    	let current;
    	let dispose;

    	function cover_image_binding_1(value) {
    		/*cover_image_binding_1*/ ctx[32].call(null, value, /*chap*/ ctx[37]);
    	}

    	function cover_image_mime_binding_1(value) {
    		/*cover_image_mime_binding_1*/ ctx[33].call(null, value, /*chap*/ ctx[37]);
    	}

    	let cover_props = { size: "100px" };

    	if (/*chap*/ ctx[37].img.imageBuffer !== void 0) {
    		cover_props.image = /*chap*/ ctx[37].img.imageBuffer;
    	}

    	if (/*chap*/ ctx[37].img.mime !== void 0) {
    		cover_props.image_mime = /*chap*/ ctx[37].img.mime;
    	}

    	const cover = new Cover({ props: cover_props, $$inline: true });
    	binding_callbacks.push(() => bind(cover, "image", cover_image_binding_1));
    	binding_callbacks.push(() => bind(cover, "image_mime", cover_image_mime_binding_1));

    	function text_1_value_binding(value) {
    		/*text_1_value_binding*/ ctx[34].call(null, value, /*chap*/ ctx[37]);
    	}

    	let text_1_props = {
    		placeholder: "Titre du chapitre",
    		name: "title-" + /*chap*/ ctx[37].elementID
    	};

    	if (/*chap*/ ctx[37].tags.title !== void 0) {
    		text_1_props.value = /*chap*/ ctx[37].tags.title;
    	}

    	const text_1 = new Text({ props: text_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text_1, "value", text_1_value_binding));

    	function hms0_ms_binding(value) {
    		/*hms0_ms_binding*/ ctx[35].call(null, value, /*chap*/ ctx[37]);
    	}

    	let hms0_props = {
    		placeholder: "Début",
    		name: "start-" + /*chap*/ ctx[37].elementID
    	};

    	if (/*chap*/ ctx[37].startTimeMs !== void 0) {
    		hms0_props.ms = /*chap*/ ctx[37].startTimeMs;
    	}

    	const hms0 = new Hms({ props: hms0_props, $$inline: true });
    	binding_callbacks.push(() => bind(hms0, "ms", hms0_ms_binding));

    	function hms1_ms_binding(value) {
    		/*hms1_ms_binding*/ ctx[36].call(null, value, /*chap*/ ctx[37]);
    	}

    	let hms1_props = {
    		placeholder: "Fin",
    		name: "end-" + /*chap*/ ctx[37].elementID
    	};

    	if (/*chap*/ ctx[37].endTimeMs !== void 0) {
    		hms1_props.ms = /*chap*/ ctx[37].endTimeMs;
    	}

    	const hms1 = new Hms({ props: hms1_props, $$inline: true });
    	binding_callbacks.push(() => bind(hms1, "ms", hms1_ms_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			create_component(cover.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();
    			img2 = element("img");
    			t3 = space();
    			div2 = element("div");
    			create_component(text_1.$$.fragment);
    			t4 = space();
    			create_component(hms0.$$.fragment);
    			t5 = space();
    			create_component(hms1.$$.fragment);
    			t6 = space();
    			if (img0.src !== (img0_src_value = "./img/up.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Monter");
    			attr_dev(img0, "class", "svelte-1d64fkf");
    			add_location(img0, file$4, 253, 5, 5682);
    			if (img1.src !== (img1_src_value = "./img/trash.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Supprimer");
    			attr_dev(img1, "class", "svelte-1d64fkf");
    			add_location(img1, file$4, 254, 5, 5741);
    			if (img2.src !== (img2_src_value = "./img/down.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Descendre");
    			attr_dev(img2, "class", "svelte-1d64fkf");
    			add_location(img2, file$4, 255, 5, 5814);
    			attr_dev(div0, "class", "icon svelte-1d64fkf");
    			attr_dev(div0, "index_chap", div0_index_chap_value = /*index*/ ctx[39]);
    			add_location(div0, file$4, 252, 4, 5638);
    			attr_dev(div1, "class", "left svelte-1d64fkf");
    			add_location(div1, file$4, 250, 3, 5520);
    			attr_dev(div2, "class", "right svelte-1d64fkf");
    			add_location(div2, file$4, 259, 3, 5903);
    			attr_dev(div3, "class", "chapter svelte-1d64fkf");
    			add_location(div3, file$4, 249, 2, 5494);
    			this.first = div3;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			mount_component(cover, div1, null);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, img0);
    			append_dev(div0, t1);
    			append_dev(div0, img1);
    			append_dev(div0, t2);
    			append_dev(div0, img2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			mount_component(text_1, div2, null);
    			append_dev(div2, t4);
    			mount_component(hms0, div2, null);
    			append_dev(div2, t5);
    			mount_component(hms1, div2, null);
    			append_dev(div3, t6);
    			current = true;

    			dispose = [
    				listen_dev(img0, "click", /*up*/ ctx[14], false, false, false),
    				listen_dev(img1, "click", /*deleteChap*/ ctx[15], false, false, false),
    				listen_dev(img2, "click", /*down*/ ctx[16], false, false, false)
    			];
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const cover_changes = {};

    			if (!updating_image && dirty[0] & /*chapter_list*/ 1024) {
    				updating_image = true;
    				cover_changes.image = /*chap*/ ctx[37].img.imageBuffer;
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_image_mime && dirty[0] & /*chapter_list*/ 1024) {
    				updating_image_mime = true;
    				cover_changes.image_mime = /*chap*/ ctx[37].img.mime;
    				add_flush_callback(() => updating_image_mime = false);
    			}

    			cover.$set(cover_changes);

    			if (!current || dirty[0] & /*chapter_list*/ 1024 && div0_index_chap_value !== (div0_index_chap_value = /*index*/ ctx[39])) {
    				attr_dev(div0, "index_chap", div0_index_chap_value);
    			}

    			const text_1_changes = {};
    			if (dirty[0] & /*chapter_list*/ 1024) text_1_changes.name = "title-" + /*chap*/ ctx[37].elementID;

    			if (!updating_value && dirty[0] & /*chapter_list*/ 1024) {
    				updating_value = true;
    				text_1_changes.value = /*chap*/ ctx[37].tags.title;
    				add_flush_callback(() => updating_value = false);
    			}

    			text_1.$set(text_1_changes);
    			const hms0_changes = {};
    			if (dirty[0] & /*chapter_list*/ 1024) hms0_changes.name = "start-" + /*chap*/ ctx[37].elementID;

    			if (!updating_ms && dirty[0] & /*chapter_list*/ 1024) {
    				updating_ms = true;
    				hms0_changes.ms = /*chap*/ ctx[37].startTimeMs;
    				add_flush_callback(() => updating_ms = false);
    			}

    			hms0.$set(hms0_changes);
    			const hms1_changes = {};
    			if (dirty[0] & /*chapter_list*/ 1024) hms1_changes.name = "end-" + /*chap*/ ctx[37].elementID;

    			if (!updating_ms_1 && dirty[0] & /*chapter_list*/ 1024) {
    				updating_ms_1 = true;
    				hms1_changes.ms = /*chap*/ ctx[37].endTimeMs;
    				add_flush_callback(() => updating_ms_1 = false);
    			}

    			hms1.$set(hms1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cover.$$.fragment, local);
    			transition_in(text_1.$$.fragment, local);
    			transition_in(hms0.$$.fragment, local);
    			transition_in(hms1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cover.$$.fragment, local);
    			transition_out(text_1.$$.fragment, local);
    			transition_out(hms0.$$.fragment, local);
    			transition_out(hms1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(cover);
    			destroy_component(text_1);
    			destroy_component(hms0);
    			destroy_component(hms1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(249:1) {#each chapter_list as chap, index (chap.elementID)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let t0;
    	let updating_value;
    	let t1;
    	let updating_value_1;
    	let t2;
    	let updating_value_2;
    	let t3;
    	let div0;
    	let updating_value_3;
    	let t4;
    	let updating_value_4;
    	let t5;
    	let updating_value_5;
    	let t6;
    	let updating_value_6;
    	let t7;
    	let updating_value_7;
    	let t8;
    	let updating_image;
    	let updating_image_mime;
    	let t9;
    	let h2;
    	let t11;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t12;
    	let t13;
    	let current;

    	const button0 = new Button({
    			props: { text: "Changer de fichier" },
    			$$inline: true
    		});

    	button0.$on("click", /*backToFileSelect*/ ctx[13]);

    	function text0_value_binding(value) {
    		/*text0_value_binding*/ ctx[22].call(null, value);
    	}

    	let text0_props = { placeholder: "Titre", name: "title" };

    	if (/*title*/ ctx[0] !== void 0) {
    		text0_props.value = /*title*/ ctx[0];
    	}

    	const text0 = new Text({ props: text0_props, $$inline: true });
    	binding_callbacks.push(() => bind(text0, "value", text0_value_binding));

    	function text1_value_binding(value) {
    		/*text1_value_binding*/ ctx[23].call(null, value);
    	}

    	let text1_props = {
    		placeholder: "Interprete",
    		name: "artist"
    	};

    	if (/*artist*/ ctx[1] !== void 0) {
    		text1_props.value = /*artist*/ ctx[1];
    	}

    	const text1 = new Text({ props: text1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text1, "value", text1_value_binding));

    	function text2_value_binding(value) {
    		/*text2_value_binding*/ ctx[24].call(null, value);
    	}

    	let text2_props = { placeholder: "Album", name: "album" };

    	if (/*album*/ ctx[2] !== void 0) {
    		text2_props.value = /*album*/ ctx[2];
    	}

    	const text2 = new Text({ props: text2_props, $$inline: true });
    	binding_callbacks.push(() => bind(text2, "value", text2_value_binding));

    	function text3_value_binding(value) {
    		/*text3_value_binding*/ ctx[25].call(null, value);
    	}

    	let text3_props = {
    		placeholder: "Année",
    		name: "year",
    		type: "number"
    	};

    	if (/*year*/ ctx[3] !== void 0) {
    		text3_props.value = /*year*/ ctx[3];
    	}

    	const text3 = new Text({ props: text3_props, $$inline: true });
    	binding_callbacks.push(() => bind(text3, "value", text3_value_binding));

    	function text4_value_binding(value) {
    		/*text4_value_binding*/ ctx[26].call(null, value);
    	}

    	let text4_props = {
    		placeholder: "Numéro de piste",
    		name: "trackNumber",
    		type: "number"
    	};

    	if (/*trackNumber*/ ctx[6] !== void 0) {
    		text4_props.value = /*trackNumber*/ ctx[6];
    	}

    	const text4 = new Text({ props: text4_props, $$inline: true });
    	binding_callbacks.push(() => bind(text4, "value", text4_value_binding));

    	function text5_value_binding(value) {
    		/*text5_value_binding*/ ctx[27].call(null, value);
    	}

    	let text5_props = { placeholder: "Genre", name: "genre" };

    	if (/*genre*/ ctx[5] !== void 0) {
    		text5_props.value = /*genre*/ ctx[5];
    	}

    	const text5 = new Text({ props: text5_props, $$inline: true });
    	binding_callbacks.push(() => bind(text5, "value", text5_value_binding));

    	function text6_value_binding(value) {
    		/*text6_value_binding*/ ctx[28].call(null, value);
    	}

    	let text6_props = {
    		placeholder: "Compositeur",
    		name: "composer"
    	};

    	if (/*composer*/ ctx[4] !== void 0) {
    		text6_props.value = /*composer*/ ctx[4];
    	}

    	const text6 = new Text({ props: text6_props, $$inline: true });
    	binding_callbacks.push(() => bind(text6, "value", text6_value_binding));

    	function text7_value_binding(value) {
    		/*text7_value_binding*/ ctx[29].call(null, value);
    	}

    	let text7_props = {
    		placeholder: "Artiste de l'album",
    		name: "performerInfo"
    	};

    	if (/*performerInfo*/ ctx[7] !== void 0) {
    		text7_props.value = /*performerInfo*/ ctx[7];
    	}

    	const text7 = new Text({ props: text7_props, $$inline: true });
    	binding_callbacks.push(() => bind(text7, "value", text7_value_binding));

    	function cover_image_binding(value) {
    		/*cover_image_binding*/ ctx[30].call(null, value);
    	}

    	function cover_image_mime_binding(value) {
    		/*cover_image_mime_binding*/ ctx[31].call(null, value);
    	}

    	let cover_props = {};

    	if (/*image*/ ctx[8] !== void 0) {
    		cover_props.image = /*image*/ ctx[8];
    	}

    	if (/*image_mime*/ ctx[9] !== void 0) {
    		cover_props.image_mime = /*image_mime*/ ctx[9];
    	}

    	const cover = new Cover({ props: cover_props, $$inline: true });
    	binding_callbacks.push(() => bind(cover, "image", cover_image_binding));
    	binding_callbacks.push(() => bind(cover, "image_mime", cover_image_mime_binding));
    	let each_value = /*chapter_list*/ ctx[10];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*chap*/ ctx[37].elementID;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const button1 = new Button({
    			props: { text: "Ajouter un chapitre" },
    			$$inline: true
    		});

    	button1.$on("click", /*addChapter*/ ctx[11]);

    	const button2 = new Button({
    			props: { text: "Sauvegarder" },
    			$$inline: true
    		});

    	button2.$on("click", /*saveTag*/ ctx[12]);

    	const block = {
    		c: function create() {
    			create_component(button0.$$.fragment);
    			t0 = space();
    			create_component(text0.$$.fragment);
    			t1 = space();
    			create_component(text1.$$.fragment);
    			t2 = space();
    			create_component(text2.$$.fragment);
    			t3 = space();
    			div0 = element("div");
    			create_component(text3.$$.fragment);
    			t4 = space();
    			create_component(text4.$$.fragment);
    			t5 = space();
    			create_component(text5.$$.fragment);
    			t6 = space();
    			create_component(text6.$$.fragment);
    			t7 = space();
    			create_component(text7.$$.fragment);
    			t8 = space();
    			create_component(cover.$$.fragment);
    			t9 = space();
    			h2 = element("h2");
    			h2.textContent = "🔖 Les Chapitres";
    			t11 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			create_component(button1.$$.fragment);
    			t13 = space();
    			create_component(button2.$$.fragment);
    			attr_dev(div0, "class", "triple svelte-1d64fkf");
    			add_location(div0, file$4, 235, 0, 4875);
    			attr_dev(h2, "class", "svelte-1d64fkf");
    			add_location(h2, file$4, 245, 0, 5380);
    			attr_dev(div1, "class", "chapter_list svelte-1d64fkf");
    			add_location(div1, file$4, 247, 0, 5409);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(button0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(text0, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(text1, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(text2, target, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div0, anchor);
    			mount_component(text3, div0, null);
    			append_dev(div0, t4);
    			mount_component(text4, div0, null);
    			append_dev(div0, t5);
    			mount_component(text5, div0, null);
    			insert_dev(target, t6, anchor);
    			mount_component(text6, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(text7, target, anchor);
    			insert_dev(target, t8, anchor);
    			mount_component(cover, target, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			insert_dev(target, t12, anchor);
    			mount_component(button1, target, anchor);
    			insert_dev(target, t13, anchor);
    			mount_component(button2, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const text0_changes = {};

    			if (!updating_value && dirty[0] & /*title*/ 1) {
    				updating_value = true;
    				text0_changes.value = /*title*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			text0.$set(text0_changes);
    			const text1_changes = {};

    			if (!updating_value_1 && dirty[0] & /*artist*/ 2) {
    				updating_value_1 = true;
    				text1_changes.value = /*artist*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			text1.$set(text1_changes);
    			const text2_changes = {};

    			if (!updating_value_2 && dirty[0] & /*album*/ 4) {
    				updating_value_2 = true;
    				text2_changes.value = /*album*/ ctx[2];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			text2.$set(text2_changes);
    			const text3_changes = {};

    			if (!updating_value_3 && dirty[0] & /*year*/ 8) {
    				updating_value_3 = true;
    				text3_changes.value = /*year*/ ctx[3];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			text3.$set(text3_changes);
    			const text4_changes = {};

    			if (!updating_value_4 && dirty[0] & /*trackNumber*/ 64) {
    				updating_value_4 = true;
    				text4_changes.value = /*trackNumber*/ ctx[6];
    				add_flush_callback(() => updating_value_4 = false);
    			}

    			text4.$set(text4_changes);
    			const text5_changes = {};

    			if (!updating_value_5 && dirty[0] & /*genre*/ 32) {
    				updating_value_5 = true;
    				text5_changes.value = /*genre*/ ctx[5];
    				add_flush_callback(() => updating_value_5 = false);
    			}

    			text5.$set(text5_changes);
    			const text6_changes = {};

    			if (!updating_value_6 && dirty[0] & /*composer*/ 16) {
    				updating_value_6 = true;
    				text6_changes.value = /*composer*/ ctx[4];
    				add_flush_callback(() => updating_value_6 = false);
    			}

    			text6.$set(text6_changes);
    			const text7_changes = {};

    			if (!updating_value_7 && dirty[0] & /*performerInfo*/ 128) {
    				updating_value_7 = true;
    				text7_changes.value = /*performerInfo*/ ctx[7];
    				add_flush_callback(() => updating_value_7 = false);
    			}

    			text7.$set(text7_changes);
    			const cover_changes = {};

    			if (!updating_image && dirty[0] & /*image*/ 256) {
    				updating_image = true;
    				cover_changes.image = /*image*/ ctx[8];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_image_mime && dirty[0] & /*image_mime*/ 512) {
    				updating_image_mime = true;
    				cover_changes.image_mime = /*image_mime*/ ctx[9];
    				add_flush_callback(() => updating_image_mime = false);
    			}

    			cover.$set(cover_changes);

    			if (dirty[0] & /*chapter_list, down, deleteChap, up*/ 115712) {
    				const each_value = /*chapter_list*/ ctx[10];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(text0.$$.fragment, local);
    			transition_in(text1.$$.fragment, local);
    			transition_in(text2.$$.fragment, local);
    			transition_in(text3.$$.fragment, local);
    			transition_in(text4.$$.fragment, local);
    			transition_in(text5.$$.fragment, local);
    			transition_in(text6.$$.fragment, local);
    			transition_in(text7.$$.fragment, local);
    			transition_in(cover.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(button1.$$.fragment, local);
    			transition_in(button2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(text0.$$.fragment, local);
    			transition_out(text1.$$.fragment, local);
    			transition_out(text2.$$.fragment, local);
    			transition_out(text3.$$.fragment, local);
    			transition_out(text4.$$.fragment, local);
    			transition_out(text5.$$.fragment, local);
    			transition_out(text6.$$.fragment, local);
    			transition_out(text7.$$.fragment, local);
    			transition_out(cover.$$.fragment, local);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(button1.$$.fragment, local);
    			transition_out(button2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(button0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(text0, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(text1, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(text2, detaching);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div0);
    			destroy_component(text3);
    			destroy_component(text4);
    			destroy_component(text5);
    			if (detaching) detach_dev(t6);
    			destroy_component(text6, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(text7, detaching);
    			if (detaching) detach_dev(t8);
    			destroy_component(cover, detaching);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t12);
    			destroy_component(button1, detaching);
    			if (detaching) detach_dev(t13);
    			destroy_component(button2, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function parseImg(img, normalImg) {
    	return img != undefined ? normalImg : undefined;
    }

    function move(arr, old_index, new_index) {
    	if (new_index < 0 || new_index >= arr.length) return arr;
    	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    	return arr;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	const dispatch = createEventDispatcher();
    	let { file_path = "" } = $$props;
    	const NodeID3 = require("node-id3");
    	const { dialog } = require("electron").remote;
    	let tags = NodeID3.read(file_path);
    	let title = tags.title;
    	let artist = tags.artist;
    	let album = tags.album;
    	let year = tags.year;
    	let composer = tags.composer;
    	let genre = tags.genre;
    	let trackNumber = tags.trackNumber;
    	let performerInfo = tags.performerInfo;

    	let image = tags.image != undefined
    	? tags.image.imageBuffer
    	: undefined;

    	let image_mime = tags.image != undefined ? tags.image.mime : undefined;
    	let chapter_list = tags.chapter || [];

    	chapter_list.forEach((c, i) => {
    		if (c.tags.image != undefined) {
    			$$invalidate(
    				10,
    				chapter_list[i].img = {
    					imageBuffer: c.tags.image.imageBuffer,
    					mime: c.tags.image.mime
    				},
    				chapter_list
    			);
    		} else {
    			$$invalidate(10, chapter_list[i].img = { imageBuffer: undefined, mime: undefined }, chapter_list);
    		}

    		if (chapter_list[i].tags == undefined) {
    			$$invalidate(10, chapter_list[i].tags = {}, chapter_list);
    		}
    	});

    	function addChapter() {
    		let new_chapter = {
    			elementID: "" + Date.now(),
    			startTimeMs: 1,
    			endTimeMs: 1000,
    			tags: { title: "" },
    			img: { imageBuffer: undefined, mime: undefined }
    		};

    		chapter_list.push(new_chapter);
    		$$invalidate(10, chapter_list);
    	}

    	function saveTag() {
    		let new_tags = { ...tags };

    		new_tags = {
    			title,
    			artist,
    			album,
    			year: "" + year,
    			composer,
    			genre,
    			trackNumber,
    			performerInfo
    		};

    		if (image != undefined) {
    			new_tags.image = {
    				mime: image_mime,
    				type: { id: 3, name: "front cover" },
    				description: "Cover",
    				imageBuffer: image
    			};
    		}

    		if (chapter_list.length != 0) {
    			chapter_list.forEach((c, i) => {
    				if (c.img.imageBuffer != undefined) {
    					c.tags.image = {
    						mime: c.img.mime,
    						type: { id: 3, name: "front cover" },
    						description: "Cover chapter " + i,
    						imageBuffer: c.img.imageBuffer
    					};
    				}

    				c.elementID = "chap" + i;
    				$$invalidate(10, chapter_list[i] = c, chapter_list);
    			});

    			new_tags.chapter = chapter_list;
    			let success = NodeID3.write(new_tags, file_path);

    			if (success) {
    				dialog.showMessageBox(undefined, {
    					type: "info",
    					title: "Tags sauvegardés!",
    					message: "Tous les tags ont été sauvegardés dans votre fichier!"
    				});
    			}
    		} else {
    			let success = NodeID3.write(new_tags, file_path);

    			if (success) {
    				dialog.showMessageBox(undefined, {
    					type: "info",
    					title: "Tags sauvegardés!",
    					message: "Tous les tags ont été sauvegardés dans votre fichier!"
    				});
    			}
    		}
    	}

    	function backToFileSelect() {
    		dispatch("back");
    	}

    	function up(e) {
    		let pos = e.target.parentElement.attributes.index_chap.nodeValue;
    		move(chapter_list, pos, pos - 1);
    		$$invalidate(10, chapter_list);
    	}

    	function deleteChap(e) {
    		chapter_list.splice(e.target.parentElement.attributes.index_chap.nodeValue, 1);
    		$$invalidate(10, chapter_list);
    	}

    	function down(e) {
    		let pos = e.target.parentElement.attributes.index_chap.nodeValue;
    		move(chapter_list, pos, pos + 1);
    		$$invalidate(10, chapter_list);
    	}

    	const writable_props = ["file_path"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Chapter_editor> was created with unknown prop '${key}'`);
    	});

    	function text0_value_binding(value) {
    		title = value;
    		$$invalidate(0, title);
    	}

    	function text1_value_binding(value) {
    		artist = value;
    		$$invalidate(1, artist);
    	}

    	function text2_value_binding(value) {
    		album = value;
    		$$invalidate(2, album);
    	}

    	function text3_value_binding(value) {
    		year = value;
    		$$invalidate(3, year);
    	}

    	function text4_value_binding(value) {
    		trackNumber = value;
    		$$invalidate(6, trackNumber);
    	}

    	function text5_value_binding(value) {
    		genre = value;
    		$$invalidate(5, genre);
    	}

    	function text6_value_binding(value) {
    		composer = value;
    		$$invalidate(4, composer);
    	}

    	function text7_value_binding(value) {
    		performerInfo = value;
    		$$invalidate(7, performerInfo);
    	}

    	function cover_image_binding(value) {
    		image = value;
    		$$invalidate(8, image);
    	}

    	function cover_image_mime_binding(value) {
    		image_mime = value;
    		$$invalidate(9, image_mime);
    	}

    	function cover_image_binding_1(value, chap) {
    		chap.img.imageBuffer = value;
    		$$invalidate(10, chapter_list);
    	}

    	function cover_image_mime_binding_1(value, chap) {
    		chap.img.mime = value;
    		$$invalidate(10, chapter_list);
    	}

    	function text_1_value_binding(value, chap) {
    		chap.tags.title = value;
    		$$invalidate(10, chapter_list);
    	}

    	function hms0_ms_binding(value, chap) {
    		chap.startTimeMs = value;
    		$$invalidate(10, chapter_list);
    	}

    	function hms1_ms_binding(value, chap) {
    		chap.endTimeMs = value;
    		$$invalidate(10, chapter_list);
    	}

    	$$self.$set = $$props => {
    		if ("file_path" in $$props) $$invalidate(17, file_path = $$props.file_path);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		file_path,
    		NodeID3,
    		dialog,
    		Text,
    		Cover,
    		HMS: Hms,
    		Button,
    		tags,
    		title,
    		artist,
    		album,
    		year,
    		composer,
    		genre,
    		trackNumber,
    		performerInfo,
    		image,
    		image_mime,
    		chapter_list,
    		addChapter,
    		saveTag,
    		parseImg,
    		backToFileSelect,
    		up,
    		deleteChap,
    		down,
    		move,
    		require,
    		undefined,
    		Date
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_path" in $$props) $$invalidate(17, file_path = $$props.file_path);
    		if ("tags" in $$props) tags = $$props.tags;
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("artist" in $$props) $$invalidate(1, artist = $$props.artist);
    		if ("album" in $$props) $$invalidate(2, album = $$props.album);
    		if ("year" in $$props) $$invalidate(3, year = $$props.year);
    		if ("composer" in $$props) $$invalidate(4, composer = $$props.composer);
    		if ("genre" in $$props) $$invalidate(5, genre = $$props.genre);
    		if ("trackNumber" in $$props) $$invalidate(6, trackNumber = $$props.trackNumber);
    		if ("performerInfo" in $$props) $$invalidate(7, performerInfo = $$props.performerInfo);
    		if ("image" in $$props) $$invalidate(8, image = $$props.image);
    		if ("image_mime" in $$props) $$invalidate(9, image_mime = $$props.image_mime);
    		if ("chapter_list" in $$props) $$invalidate(10, chapter_list = $$props.chapter_list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		artist,
    		album,
    		year,
    		composer,
    		genre,
    		trackNumber,
    		performerInfo,
    		image,
    		image_mime,
    		chapter_list,
    		addChapter,
    		saveTag,
    		backToFileSelect,
    		up,
    		deleteChap,
    		down,
    		file_path,
    		dispatch,
    		NodeID3,
    		dialog,
    		tags,
    		text0_value_binding,
    		text1_value_binding,
    		text2_value_binding,
    		text3_value_binding,
    		text4_value_binding,
    		text5_value_binding,
    		text6_value_binding,
    		text7_value_binding,
    		cover_image_binding,
    		cover_image_mime_binding,
    		cover_image_binding_1,
    		cover_image_mime_binding_1,
    		text_1_value_binding,
    		hms0_ms_binding,
    		hms1_ms_binding
    	];
    }

    class Chapter_editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { file_path: 17 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chapter_editor",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get file_path() {
    		throw new Error("<Chapter_editor>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set file_path(value) {
    		throw new Error("<Chapter_editor>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.19.1 */
    const file$5 = "src\\App.svelte";

    // (49:1) {:else}
    function create_else_block(ctx) {
    	let current;

    	const chaptereditor = new Chapter_editor({
    			props: { file_path: /*file_path*/ ctx[1] },
    			$$inline: true
    		});

    	chaptereditor.$on("back", /*back_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			create_component(chaptereditor.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(chaptereditor, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const chaptereditor_changes = {};
    			if (dirty & /*file_path*/ 2) chaptereditor_changes.file_path = /*file_path*/ ctx[1];
    			chaptereditor.$set(chaptereditor_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chaptereditor.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chaptereditor.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(chaptereditor, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(49:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:1) {#if !file_chosed}
    function create_if_block(ctx) {
    	let current;
    	const fileselect = new File_select({ $$inline: true });
    	fileselect.$on("file", /*fileChosed*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(fileselect.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(fileselect, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(fileselect.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(fileselect.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(fileselect, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(47:1) {#if !file_chosed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div0;
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let div1;
    	let p0;
    	let t3;
    	let a0;
    	let t5;
    	let p1;
    	let t6;
    	let a1;
    	let t8;
    	let a2;
    	let current;
    	let dispose;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*file_chosed*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "PodChapter";
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			div1 = element("div");
    			p0 = element("p");
    			t3 = text("PodChapter est développé par ");
    			a0 = element("a");
    			a0.textContent = "Bigaston";
    			t5 = space();
    			p1 = element("p");
    			t6 = text("⌨️ ");
    			a1 = element("a");
    			a1.textContent = "Code Source";
    			t8 = text(" | 💸 ");
    			a2 = element("a");
    			a2.textContent = "Me soutenir";
    			attr_dev(h1, "class", "svelte-azqhdo");
    			add_location(h1, file$5, 45, 1, 700);
    			attr_dev(div0, "class", "wrapper svelte-azqhdo");
    			add_location(div0, file$5, 44, 0, 677);
    			attr_dev(a0, "href", "https://twitter.com/Bigaston");
    			attr_dev(a0, "class", "svelte-azqhdo");
    			add_location(a0, file$5, 54, 33, 948);
    			add_location(p0, file$5, 54, 1, 916);
    			attr_dev(a1, "href", "https://github.com/Bigaston/podchapter");
    			attr_dev(a1, "class", "svelte-azqhdo");
    			add_location(a1, file$5, 55, 7, 1031);
    			attr_dev(a2, "href", "https://utip.io/bigaston");
    			attr_dev(a2, "class", "svelte-azqhdo");
    			add_location(a2, file$5, 55, 97, 1121);
    			add_location(p1, file$5, 55, 1, 1025);
    			attr_dev(div1, "class", "footer svelte-azqhdo");
    			add_location(div1, file$5, 53, 0, 894);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			if_blocks[current_block_type_index].m(div0, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, p0);
    			append_dev(p0, t3);
    			append_dev(p0, a0);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(p1, t6);
    			append_dev(p1, a1);
    			append_dev(p1, t8);
    			append_dev(p1, a2);
    			current = true;

    			dispose = [
    				listen_dev(a0, "click", /*openLink*/ ctx[3], false, false, false),
    				listen_dev(a1, "click", /*openLink*/ ctx[3], false, false, false),
    				listen_dev(a2, "click", /*openLink*/ ctx[3], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div0, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const { shell } = require("electron");
    	let file_chosed = false;
    	let file_path = "";

    	function fileChosed(e) {
    		$$invalidate(1, file_path = e.detail);
    		$$invalidate(0, file_chosed = true);
    	}

    	function openLink(e) {
    		e.preventDefault();
    		shell.openExternal(e.target.attributes.href.nodeValue);
    	}

    	const back_handler = () => {
    		$$invalidate(1, file_path = undefined);
    		$$invalidate(0, file_chosed = false);
    	};

    	$$self.$capture_state = () => ({
    		FileSelect: File_select,
    		ChapterEditor: Chapter_editor,
    		shell,
    		file_chosed,
    		file_path,
    		fileChosed,
    		openLink,
    		require
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_chosed" in $$props) $$invalidate(0, file_chosed = $$props.file_chosed);
    		if ("file_path" in $$props) $$invalidate(1, file_path = $$props.file_path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [file_chosed, file_path, fileChosed, openLink, shell, back_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
