import { mkdir } from "fs/promises";
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from "../../src/utils";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import { gamepadTargets, getWasm } from "../../src";

interface YawPitch {
    yaw: number;
    pitch: number;
    coords: string;
}

interface CanvasListeners {
    [key: string]: Set<Function>;
}

export interface iWasmExports {
    closure30_externref_shim(arg0: any, arg1: any, arg2: any): unknown;
    memory: WebAssembly.Memory;
    process: (ptr: number, len: number) => void;
    start: () => void;
    validate: (ptr: number, len: number) => [number, number]; // sha256 with a salt
    get_yaw_pitch: () => YawPitch;
    set_mouse_params: (sensitivity: number, invert: number, fov: number, scoped: boolean, unique_id_ptr: number, ptr_len: number) => void;
    reset_yaw_pitch: () => void;
    poll_gamepad: (gamepadIndex: number, deadzone: number, controllerSpeed: number, scoped: boolean, invert: number, players: object, camera: any, playerId: number, playerTeam: number) => void;
    __externref_table_alloc: () => number;
    __wbindgen_exn_store: () => void;
    __wbindgen_export_2: WebAssembly.Table;
    __wbindgen_export_5: WebAssembly.Table;
    __wbindgen_free: (ptr: number, len: number, align: number) => void;
    __wbindgen_malloc: (len: number, align: number) => number;
    __wbindgen_realloc: () => void;
    __wbindgen_start: () => void;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === "undefined")
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry((state: any) => {
        getWasm().__wbindgen_export_5.get(state.dtor)(state.a, state.b)
    });

// this seems to be used to run a function in the wasm from js, e.g a callback
export const makeMutClosure = (arg0: any, arg1: any, dtor: any, f: any) => {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args: any[]) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won"t
        // be deallocated while we"re invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                getWasm().__wbindgen_export_5.get(state.dtor)(a, state.b);
                CLOSURE_DTORS.unregister(state);
            } else {
                state.a = a;
            }
        }
    };
    real.original = state;
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function __wbg_adapter_24(arg0: any, arg1: any, arg2: any) {
    getWasm().closure30_externref_shim(arg0, arg1, arg2);
}

const element = {
    textContent: "",
}

export const canvasListeners: CanvasListeners = {};

let iterationCount = 1;

// the mock implementation of all the imports passed to the wasm
export const imports = {
    wbg: {
        __wbg_addEventListener_90e553fdce254421: (target: any, arg1: any, arg2: any, callback: Function) => {
            const event = getStringFromWasm(arg1, arg2);
            console.log("__wbg_addEventListener_90e553fdce254421");
            canvasListeners[event] = canvasListeners[event] || new Set();
            canvasListeners[event].add(callback);
        },
        __wbg_appendChild_8204974b7328bf98: () => {
            console.log("__wbg_appendChild_8204974b7328bf98");
        },
        __wbg_axes_b1da727bd9ea422d: (arg0: any) => {
            console.log("__wbg_axes_b1da727bd9ea422d");

            const targetYaw = gamepadTargets.yaw;
            const targetPitch = gamepadTargets.pitch;

            console.log('yp', targetYaw, targetPitch);

            function f(x: number) {
                const x1 = 0.31, y1 = 13.285;
                const x2 = 6, y2 = 12.778;
                return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
            }

            return [0, 0, -(targetYaw * f(targetYaw)), -targetPitch * f(targetPitch)];
        },
        __wbg_body_942ea927546a04ba: (...args: any[]) => {
            console.log("__wbg_body_942ea927546a04ba");
            return addToExternrefTable({});
        },
        __wbg_call_672a4d21634d4a24: (...args: any[]) => {
            console.trace("__wbg_call_672a4d21634d4a24");
        },
        __wbg_childNodes_c4423003f3a9441f: (...args: any[]) => {
            console.log("__wbg_childNodes_c4423003f3a9441f");
            return [];
        },
        __wbg_createElement_8c9931a732ee2fea: (...args: any[]) => {
            console.log("__wbg_createElement_8c9931a732ee2fea");
            return element;
        },
        __wbg_document_d249400bd7bd996d: () => {
            console.log("__wbg_document_d249400bd7bd996d");
            return addToExternrefTable({});
        },
        __wbg_from_2a5d3e218e67aa85: (...args: any[]) => {
            console.log("__wbg_from_2a5d3e218e67aa85");
            return Array.from(args[0]);
        },
        __wbg_getElementById_f827f0d6648718a8: (arg0: any, arg1: any, arg2: any) => {
            console.log("__wbg_getElementById_f827f0d6648718a8");
            return addToExternrefTable({});
        },
        __wbg_getGamepads_1f997cef580c9088: (...args: any[]) => {
            return [{ _isGetGamepads: 1 }];
        },
        __wbg_get_67b2ba62fc30de12: (...args: any[]) => {
            console.log("__wbg_get_67b2ba62fc30de12");
            return Reflect.get(args[0], args[1]);
        },
        __wbg_get_b9b93047fe3cf45b: (...args: any[]) => {
            console.log("__wbg_get_b9b93047fe3cf45b");
            return args[0][args[1] >>> 0];
        },
        __wbg_instanceof_Gamepad_365ec8404255ce00: (...args: any[]) => {
            console.log("__wbg_instanceof_Gamepad_365ec8404255ce00");
            return true;
        },
        __wbg_instanceof_HtmlCanvasElement_2ea67072a7624ac5: (...args: any[]) => {
            console.log("__wbg_instanceof_HtmlCanvasElement_2ea67072a7624ac5");
            return true;
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            console.log("__wbg_instanceof_Window_def73ea0955fc569");
            return true;
        },
        __wbg_isTrusted_cc994b7949c53593: (...args: any[]) => {
            console.log("__wbg_isTrusted_cc994b7949c53593");
            return true;
        },
        __wbg_item_8be407c958853a13: (...args: any[]) => {
            console.log("__wbg_item_8be407c958853a13");
            const ret = args[0][args[1] >>> 0];
            console.log(ret, args[0]);
            return addToExternrefTable(ret);
        },
        __wbg_length_49b2ba67f0897e97: (...args: any[]) => {
            console.log("__wbg_length_49b2ba67f0897e97");
            iterationCount--;
            return iterationCount <= 0 ? 0 : iterationCount;
        },
        __wbg_length_e2d2a49132c1b256: (...args: any[]) => {
            console.log("__wbg_length_e2d2a49132c1b256");
            return args[0].length;
        },
        __wbg_movementX_1aa05f864931369b: (...args: any[]) => {
            console.log("__wbg_movementX_1aa05f864931369b");
            return args[0].movementX;
        },
        __wbg_movementY_8acfedb38a70e624: (...args: any[]) => {
            console.log("__wbg_movementY_8acfedb38a70e624");
            return args[0].movementY;
        },
        __wbg_navigator_1577371c070c8947: (...args: any[]) => {
            console.log("__wbg_navigator_1577371c070c8947");
            return args[0].navigator;
        },
        __wbg_new_405e22f390576ce2: () => {
            console.log("__wbg_new_405e22f390576ce2");
            return new Object();
        },
        __wbg_newnoargs_105ed471475aaf50: () => {
            console.trace("__wbg_newnoargs_105ed471475aaf50");
        },
        __wbg_nodeType_5e1153141daac26a: (arg0: any) => {
            console.log("__wbg_nodeType_5e1153141daac26a");
            return 3; // TEXT_NODE - https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        },
        __wbg_now_807e54c39636c349: () => {
            console.log("__wbg_now_807e54c39636c349");
            return Date.now();
        },
        __wbg_set_bb8cecf6a62b9f46: (...args: any[]) => {
            console.log("__wbg_set_bb8cecf6a62b9f46");
            return Reflect.set(args[0], args[1], args[2]);
        },
        __wbg_settextContent_d29397f7b994d314: async (...args: any[]) => {
            console.log("__wbg_settextContent_d29397f7b994d314");
            element.textContent = getStringFromWasm(args[1], args[2]);

            if (!(existsSync("out"))) await mkdir("out");
            await writeFile("out/shellshock.js", element.textContent);
        },
        __wbg_static_accessor_GLOBAL_88a902d13a557d07: (...args: any[]) => {
            console.trace("__wbg_static_accessor_GLOBAL_88a902d13a557d07");
        },
        __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: (...args: any[]) => {
            console.trace("__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0");
        },
        __wbg_static_accessor_SELF_37c5d418e4bf5819: (...args: any[]) => {
            console.log("__wbg_static_accessor_SELF_37c5d418e4bf5819");
            return addToExternrefTable({});
        },
        __wbg_static_accessor_WINDOW_5de37043a91a9c40: (...args: any[]) => {
            console.log("__wbg_static_accessor_WINDOW_5de37043a91a9c40");
            return addToExternrefTable({});
        },
        __wbg_textContent_215d0f87d539368a: (outPtr: number, targetElement: any) => {
            console.log("__wbg_textContent_215d0f87d539368a"); // sigh bwd, is this really necessary?
            const [ptr, len] = passStringToWasm(targetElement == element ? element.textContent : "\nvar comp_spinner_overlay = {\n\ttemplate: '#spinner-overlay-template',\n\tcomponents: {\n\t\t'wobbly-egg': comp_wobbly_egg\n\t},\n\tprops: ['loc', 'adblockerbanner', 'hideAds', 'adUnit', 'accountDate'],\n\t\n\tdata: function () {\n\t\treturn {\n\t\t\tisShowing: false,\n\t\t\theader: '',\n\t\t\tfooter: '',\n\t\t\tadIsShowing: false,\n\t\t\tisShowTips: false,\n\t\t\ttipKey: null,\n\t\t\ttips: [],\n\t\t\ttip: '',\n\t\t\teggGuyImg: 'img/shellShockers_loadingTipEgg.webp',\n\t\t\tgoodBrowser: true,\n\t\t\tbrowserTipShown: false,\n\t\t}\n\t},\n\n\tmounted() {\n\t\tthis.isNotChrome().then(result => {\n\t\t\tif (result) {\n\t\t\t\tthis.goodBrowser = false;\n\t\t\t}\n\t\t});\n\t},\n\n\tmethods: {\n\t\tshow: function (headerLocKey, footerLocKey, showTips) {\n\t\t\tthis.header = this.loc[headerLocKey];\n\t\t\tthis.footer = this.loc[footerLocKey];\n\t\t\tthis.isShowing = true;\n\t\t\tthis.isShowTips = showTips;\n\t\t},\n\n\t\tshowSpinnerLoadProgress: function (percent) {\n\t\t\tvar msg = this.loc['ui_game_loading'];\n\t\t\tthis.header = this.loc['building_map'];\n\t\t\tthis.footer = '{0}... {1}%'.format(msg, percent);\n\t\t\tthis.isShowTips = true;\n\t\t\tthis.isShowing = true;\n\t\t},\n\n\t\thide: function () {\n\t\t\tthis.isShowing = false;\n\t\t\tthis.isShowTips = this.isShowing;\n\t\t\tthis.$emit('close-display-ad');\n\t\t},\n\n\t\thideDisplayAd() {\n\t\t\tthis.adIsShowing = false;\n\t\t\tconsole.log('do it');\n\t\t},\n\t\tshowDisplayAd() {\n\t\t\tthis.adIsShowing = true;\n\t\t},\n\t\ttoggleDisplayAd() {\n\t\t\treturn this.adIsShowing = this.adIsShowing ? false : true;\n\t\t},\n\t\tgetTipKey() {\n\t\t\tif (!this.accountDate) {\n\t\t\t\tthis.tipKey = 'tipNew_';\n\t\t\t} else {\n\t\t\t\tif (!this.accountDays) {\n\t\t\t\t\tthis.accountDays = Math.ceil((new Date().getTime() - new Date(this.accountDate).getTime()) / (1000 * 3600 * 24));\n\t\t\t\t}\n\t\t\t\tif (this.accountDays <= 14) {\n\t\t\t\t\tthis.tipKey = 'tipNew_';\n\t\t\t\t} else {\n\t\t\t\t\tthis.tipKey = 'tip_';\n\t\t\t\t}\n\t\t\t}\n\t\t},\n\t\trandomTip() {\n\t\t\tif (!this.goodBrowser && !this.browserTipShown) {\n\t\t\t\tthis.tip = 'tip_ofthe_day_107';\n\t\t\t\tthis.browserTipShown = true;\n\t\t\t\treturn;\n\t\t\t}\n\n\t\t\tif (this.tipKey === null) {\n\t\t\t\tthis.getTipKey();\n\t\t\t}\n\n\t\t\tif (this.tips.length === 0) {\n\t\t\t\tObject.keys(this.loc).forEach(key => {\n\t\t\t\t\tif (key.startsWith(this.tipKey)) {\n\t\t\t\t\t\tthis.tips.push(key);\n\t\t\t\t\t}\n\t\t\t\t});\n\t\t\t}\n\t\t\tthis.tip = this.tips[Math.floor(Math.random() * this.tips.length)];\n\t\t},\n\n\t\tasync isNotChrome() {\n\t\t\tif (navigator.userAgentData) {\n\t\t\t\tconst brands = navigator.userAgentData.brands || [];\n\t\t\t\tconst isChrome = brands.some(brand => brand.brand === 'Google Chrome');\n\t\t\t\treturn !isChrome;\n\t\t\t} else {\n\t\t\t\t// Fallback to userAgent for older browsers\n\t\t\t\treturn this.isNotChromeFallback();\n\t\t\t}\n\t\t},\n\t\tisNotChromeFallback() {\n\t\t\tconst ua = navigator.userAgent;\n\t\t\treturn !(ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR'));\n\t\t}\n\t},\n\twatch: {\n\t\tisShowing(val, old) {\n\t\t\tif (val && !old) {\n\t\t\t\tthis.randomTip();\n\t\t\t}\n\t\t}\n\t}\n};\n");

            const dv = new DataView(getWasm().memory.buffer);
            dv.setInt32(outPtr + 4 * 1, len, true);
            dv.setInt32(outPtr + 4 * 0, ptr, true);
        },
        __wbindgen_debug_string: (...args: any[]) => {
            console.trace("__wbindgen_debug_string", args);
        },
        __wbindgen_init_externref_table: (...args: any[]) => {
            console.trace("__wbindgen_init_externref_table", args);
        },
        __wbindgen_throw: (...args: any[]) => {
            console.trace("__wbindgen_throw", args);
        },
        __wbindgen_number_new: (arg0: number) => {
            console.log("__wbindgen_number_new", arg0);
            return arg0;
        },
        __wbindgen_string_new: (arg0: number, arg1: number) => {
            console.log("__wbindgen_string_new", getStringFromWasm(arg0, arg1));
            return getStringFromWasm(arg0, arg1);
        },
        __wbindgen_string_get: (arg0: number, arg1: number) => {
            console.log("__wbindgen_string_get");
            const str = getStringFromWasm(arg0, arg1);
            const [ptr, len] = passStringToWasm(str);
            const dv = new DataView(getWasm().memory.buffer);
            dv.setInt32(arg0 + 4 * 1, len, true);
            dv.setInt32(arg0 + 4 * 0, ptr, true);
        },
        __wbindgen_is_undefined: (arg0: any) => {
            console.log("__wbindgen_is_undefined");
            return arg0 === undefined ? 1 : 0;
        },
        __wbindgen_is_null: (arg0: any) => {
            console.log("__wbindgen_is_null");
            return arg0 === null;
        },
        __wbindgen_boolean_get: (arg0: any) => {
            console.log("__wbindgen_boolean_get");
            const v = arg0;
            const ret = typeof (v) === "boolean" ? (v ? 1 : 0) : 2;
            return ret;
        },
        __wbindgen_closure_wrapper94: (arg0: any, arg1: any, arg2: any) => {
            console.log("__wbindgen_closure_wrapper100");
            return makeMutClosure(arg0, arg1, 31, __wbg_adapter_24);
        },
        __wbindgen_closure_wrapper95: (arg0: any, arg1: any, arg2: any) => {
            console.log("__wbindgen_closure_wrapper99");
            return makeMutClosure(arg0, arg1, 31, __wbg_adapter_24);
        },
        __wbindgen_number_get: (arg0: number, arg1: number) => {
            console.log("__wbingen_number_get");
            const obj = arg1;
            const ret = typeof (obj) === "number" ? obj : undefined;
            const dv = new DataView(getWasm().memory.buffer);
            dv.setFloat64(arg0 + 8 * 1, ret!, true);
            dv.setInt32(arg0 + 4 * 0, 1, true);
        }
    }
}