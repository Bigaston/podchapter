
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
    function empty() {
        return text('');
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

    const globals = (typeof window !== 'undefined' ? window : global);

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

    /* src\pages\file_select.svelte generated by Svelte v3.19.1 */
    const file = "src\\pages\\file_select.svelte";

    function create_fragment(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "file");
    			attr_dev(input, "accept", "audio/mpeg");
    			add_location(input, file, 16, 0, 240);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[3](input);
    			dispose = listen_dev(input, "change", /*fileUploaded*/ ctx[1], false, false, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[3](null);
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
    	let file_input;

    	function fileUploaded() {
    		dispatch("file", file_input.files[0].path);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, file_input = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		file_input,
    		fileUploaded
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_input" in $$props) $$invalidate(0, file_input = $$props.file_input);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [file_input, fileUploaded, dispatch, input_binding];
    }

    class File_select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "File_select",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src\components\text.svelte generated by Svelte v3.19.1 */

    const file$1 = "src\\components\\text.svelte";

    function create_fragment$1(ctx) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
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

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			placeholder: 1,
    			value: 0,
    			name: 2,
    			type: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Text",
    			options,
    			id: create_fragment$1.name
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

    const { console: console_1 } = globals;
    const file$2 = "src\\components\\cover.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (img.src !== (img_src_value = /*img_url*/ ctx[0])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Cover");
    			attr_dev(img, "class", "svelte-180bhmu");
    			add_location(img, file$2, 50, 1, 1012);
    			attr_dev(div, "id", "editable");
    			attr_dev(div, "class", "svelte-180bhmu");
    			add_location(div, file$2, 49, 0, 969);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			dispose = listen_dev(div, "click", /*editCover*/ ctx[1], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*img_url*/ 1 && img.src !== (img_src_value = /*img_url*/ ctx[0])) {
    				attr_dev(img, "src", img_src_value);
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
    	let { image } = $$props;
    	let { image_mime } = $$props;
    	const nativeImage = require("electron").nativeImage;
    	const { dialog } = require("electron").remote;
    	let img_url;

    	if (image != undefined) {
    		img_url = nativeImage.createFromBuffer(image).toDataURL();
    	} else {
    		img_url = nativeImage.createEmpty().toDataURL();
    	}

    	console.log(img_url);

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
    			$$invalidate(2, image = native.toJPEG(100));
    			$$invalidate(3, image_mime = "jpeg");
    			$$invalidate(0, img_url = native.toDataURL());
    		}
    	}

    	const writable_props = ["image", "image_mime"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Cover> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("image_mime" in $$props) $$invalidate(3, image_mime = $$props.image_mime);
    	};

    	$$self.$capture_state = () => ({
    		image,
    		image_mime,
    		nativeImage,
    		dialog,
    		img_url,
    		editCover,
    		require,
    		undefined,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("image" in $$props) $$invalidate(2, image = $$props.image);
    		if ("image_mime" in $$props) $$invalidate(3, image_mime = $$props.image_mime);
    		if ("img_url" in $$props) $$invalidate(0, img_url = $$props.img_url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [img_url, editCover, image, image_mime];
    }

    class Cover extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { image: 2, image_mime: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cover",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*image*/ ctx[2] === undefined && !("image" in props)) {
    			console_1.warn("<Cover> was created without expected prop 'image'");
    		}

    		if (/*image_mime*/ ctx[3] === undefined && !("image_mime" in props)) {
    			console_1.warn("<Cover> was created without expected prop 'image_mime'");
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
    }

    /* src\pages\chapter_editor.svelte generated by Svelte v3.19.1 */

    const { console: console_1$1 } = globals;
    const file$3 = "src\\pages\\chapter_editor.svelte";

    function create_fragment$3(ctx) {
    	let updating_value;
    	let t0;
    	let updating_value_1;
    	let t1;
    	let updating_value_2;
    	let t2;
    	let updating_value_3;
    	let t3;
    	let updating_image;
    	let updating_image_mime;
    	let t4;
    	let button;
    	let current;
    	let dispose;

    	function text0_value_binding(value) {
    		/*text0_value_binding*/ ctx[11].call(null, value);
    	}

    	let text0_props = { placeholder: "Titre", name: "title" };

    	if (/*title*/ ctx[0] !== void 0) {
    		text0_props.value = /*title*/ ctx[0];
    	}

    	const text0 = new Text({ props: text0_props, $$inline: true });
    	binding_callbacks.push(() => bind(text0, "value", text0_value_binding));

    	function text1_value_binding(value) {
    		/*text1_value_binding*/ ctx[12].call(null, value);
    	}

    	let text1_props = { placeholder: "Artiste", name: "artist" };

    	if (/*artist*/ ctx[1] !== void 0) {
    		text1_props.value = /*artist*/ ctx[1];
    	}

    	const text1 = new Text({ props: text1_props, $$inline: true });
    	binding_callbacks.push(() => bind(text1, "value", text1_value_binding));

    	function text2_value_binding(value) {
    		/*text2_value_binding*/ ctx[13].call(null, value);
    	}

    	let text2_props = { placeholder: "Album", name: "album" };

    	if (/*album*/ ctx[2] !== void 0) {
    		text2_props.value = /*album*/ ctx[2];
    	}

    	const text2 = new Text({ props: text2_props, $$inline: true });
    	binding_callbacks.push(() => bind(text2, "value", text2_value_binding));

    	function text3_value_binding(value) {
    		/*text3_value_binding*/ ctx[14].call(null, value);
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

    	function cover_image_binding(value) {
    		/*cover_image_binding*/ ctx[15].call(null, value);
    	}

    	function cover_image_mime_binding(value) {
    		/*cover_image_mime_binding*/ ctx[16].call(null, value);
    	}

    	let cover_props = {};

    	if (/*image*/ ctx[4] !== void 0) {
    		cover_props.image = /*image*/ ctx[4];
    	}

    	if (/*image_mime*/ ctx[5] !== void 0) {
    		cover_props.image_mime = /*image_mime*/ ctx[5];
    	}

    	const cover = new Cover({ props: cover_props, $$inline: true });
    	binding_callbacks.push(() => bind(cover, "image", cover_image_binding));
    	binding_callbacks.push(() => bind(cover, "image_mime", cover_image_mime_binding));

    	const block = {
    		c: function create() {
    			create_component(text0.$$.fragment);
    			t0 = space();
    			create_component(text1.$$.fragment);
    			t1 = space();
    			create_component(text2.$$.fragment);
    			t2 = space();
    			create_component(text3.$$.fragment);
    			t3 = space();
    			create_component(cover.$$.fragment);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Sauvegarder";
    			add_location(button, file$3, 61, 0, 1503);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(text0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(text1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(text2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(text3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(cover, target, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, button, anchor);
    			current = true;
    			dispose = listen_dev(button, "click", /*saveTag*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, [dirty]) {
    			const text0_changes = {};

    			if (!updating_value && dirty & /*title*/ 1) {
    				updating_value = true;
    				text0_changes.value = /*title*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			text0.$set(text0_changes);
    			const text1_changes = {};

    			if (!updating_value_1 && dirty & /*artist*/ 2) {
    				updating_value_1 = true;
    				text1_changes.value = /*artist*/ ctx[1];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			text1.$set(text1_changes);
    			const text2_changes = {};

    			if (!updating_value_2 && dirty & /*album*/ 4) {
    				updating_value_2 = true;
    				text2_changes.value = /*album*/ ctx[2];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			text2.$set(text2_changes);
    			const text3_changes = {};

    			if (!updating_value_3 && dirty & /*year*/ 8) {
    				updating_value_3 = true;
    				text3_changes.value = /*year*/ ctx[3];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			text3.$set(text3_changes);
    			const cover_changes = {};

    			if (!updating_image && dirty & /*image*/ 16) {
    				updating_image = true;
    				cover_changes.image = /*image*/ ctx[4];
    				add_flush_callback(() => updating_image = false);
    			}

    			if (!updating_image_mime && dirty & /*image_mime*/ 32) {
    				updating_image_mime = true;
    				cover_changes.image_mime = /*image_mime*/ ctx[5];
    				add_flush_callback(() => updating_image_mime = false);
    			}

    			cover.$set(cover_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(text0.$$.fragment, local);
    			transition_in(text1.$$.fragment, local);
    			transition_in(text2.$$.fragment, local);
    			transition_in(text3.$$.fragment, local);
    			transition_in(cover.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(text0.$$.fragment, local);
    			transition_out(text1.$$.fragment, local);
    			transition_out(text2.$$.fragment, local);
    			transition_out(text3.$$.fragment, local);
    			transition_out(cover.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(text0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(text1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(text2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(text3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(cover, detaching);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(button);
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
    	let { file_path = "" } = $$props;
    	const NodeID3 = require("node-id3");
    	const { dialog } = require("electron").remote;

    	//import Button from "../components/button.svelte";
    	let tags = NodeID3.read(file_path);

    	let title = tags.title;
    	let artist = tags.artist;
    	let album = tags.album;
    	let year = tags.year;

    	let image = tags.image != undefined
    	? tags.image.imageBuffer
    	: undefined;

    	let image_mime = tags.image != undefined ? tags.image.mime : undefined;
    	console.log(tags);

    	function saveTag() {
    		let new_tags = {
    			title,
    			artist,
    			album,
    			year: "" + year,
    			image: {
    				mime: image_mime,
    				type: { id: 3, name: "front cover" },
    				description: "Cover",
    				imageBuffer: image
    			}
    		};

    		let success = NodeID3.update(new_tags, file_path);

    		if (success) {
    			dialog.showMessageBox(undefined, {
    				type: "info",
    				title: "Tags sauvegardés!",
    				message: "Tous les tags ont été sauvegardés dans votre fichier!"
    			});
    		}
    	}

    	const writable_props = ["file_path"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Chapter_editor> was created with unknown prop '${key}'`);
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

    	function cover_image_binding(value) {
    		image = value;
    		$$invalidate(4, image);
    	}

    	function cover_image_mime_binding(value) {
    		image_mime = value;
    		$$invalidate(5, image_mime);
    	}

    	$$self.$set = $$props => {
    		if ("file_path" in $$props) $$invalidate(7, file_path = $$props.file_path);
    	};

    	$$self.$capture_state = () => ({
    		file_path,
    		NodeID3,
    		dialog,
    		Text,
    		Cover,
    		tags,
    		title,
    		artist,
    		album,
    		year,
    		image,
    		image_mime,
    		saveTag,
    		require,
    		undefined,
    		console
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_path" in $$props) $$invalidate(7, file_path = $$props.file_path);
    		if ("tags" in $$props) tags = $$props.tags;
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("artist" in $$props) $$invalidate(1, artist = $$props.artist);
    		if ("album" in $$props) $$invalidate(2, album = $$props.album);
    		if ("year" in $$props) $$invalidate(3, year = $$props.year);
    		if ("image" in $$props) $$invalidate(4, image = $$props.image);
    		if ("image_mime" in $$props) $$invalidate(5, image_mime = $$props.image_mime);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		title,
    		artist,
    		album,
    		year,
    		image,
    		image_mime,
    		saveTag,
    		file_path,
    		NodeID3,
    		dialog,
    		tags,
    		text0_value_binding,
    		text1_value_binding,
    		text2_value_binding,
    		text3_value_binding,
    		cover_image_binding,
    		cover_image_mime_binding
    	];
    }

    class Chapter_editor extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { file_path: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chapter_editor",
    			options,
    			id: create_fragment$3.name
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
    const file$4 = "src\\App.svelte";

    // (24:0) {:else}
    function create_else_block(ctx) {
    	let current;

    	const chaptereditor = new Chapter_editor({
    			props: { file_path: /*file_path*/ ctx[1] },
    			$$inline: true
    		});

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
    		source: "(24:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:0) {#if !file_chosed}
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
    		source: "(22:0) {#if !file_chosed}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let h1;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
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
    			h1 = element("h1");
    			h1.textContent = "PodChapter";
    			t1 = space();
    			if_block.c();
    			if_block_anchor = empty();
    			attr_dev(h1, "class", "svelte-1s5foe9");
    			add_location(h1, file$4, 20, 0, 306);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
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

    function instance$4($$self, $$props, $$invalidate) {
    	let file_chosed = false;
    	let file_path = "";

    	function fileChosed(e) {
    		$$invalidate(1, file_path = e.detail);
    		$$invalidate(0, file_chosed = true);
    	}

    	$$self.$capture_state = () => ({
    		FileSelect: File_select,
    		ChapterEditor: Chapter_editor,
    		file_chosed,
    		file_path,
    		fileChosed
    	});

    	$$self.$inject_state = $$props => {
    		if ("file_chosed" in $$props) $$invalidate(0, file_chosed = $$props.file_chosed);
    		if ("file_path" in $$props) $$invalidate(1, file_path = $$props.file_path);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [file_chosed, file_path, fileChosed];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$4.name
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
