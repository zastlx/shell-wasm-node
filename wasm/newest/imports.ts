import { mkdir } from "fs/promises";
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from "../../src/utils";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";
import { getWasm } from '../../src';

interface YawPitch {
    yaw: number;
    pitch: number;
    coords: string;
}

export interface iWasmExports {
    closure30_externref_shim(arg0: any, arg1: any, arg2: any): unknown;
    memory: WebAssembly.Memory;
    process: (ptr: number, len: number) => void;
    start: () => void;
    validate: (ptr: number, len: number) => [number, number]; // sha256 with a salt? confirmed
    get_yaw_pitch: () => YawPitch;
    set_mouse_params: (sensitivity: number, invert: number, fov: number, scoped: boolean, ptr: number, len: number) => void;
    __externref_table_alloc: () => number;
    __wbindgen_exn_store: () => void;
    __wbindgen_export_2: WebAssembly.Table;
    __wbindgen_export_5: WebAssembly.Table;
    __wbindgen_free: (ptr: number, len: number, align: number) => void;
    __wbindgen_malloc: (len: number, align: number) => number;
    __wbindgen_realloc: () => void;
    __wbindgen_start: () => void;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry((state: any) => {
        getWasm().__wbindgen_export_5.get(state.dtor)(state.a, state.b)
    });

// this seems to be used to run a function in the wasm from js, e.g a callback
export const makeMutClosure = (arg0: any, arg1: any, dtor: any, f: any) => {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args: any[]) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
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

function __wbg_adapter_22(arg0: any, arg1: any, arg2: any) {
    getWasm().closure30_externref_shim(arg0, arg1, arg2);
}

const mockCanvas = {
    id: 'canvas'
}

interface cocaine {
    [key: string]: Function;
}

export const canvasListeners: cocaine = {};

const mockWindow = {
    document: {
        body: {}
    }
}

const element = {
    textContent: "",
}

// the mock implementation of all the imports passed to the wasm
export const imports = {
    wbg: {
        __wbg_addEventListener_90e553fdce254421: (target: any, arg1: any, arg2: any, callback: Function) => {
            const event = getStringFromWasm(arg1, arg2);
            console.log("__wbg_addEventListener_90e553fdce254421", target, event, callback);
            canvasListeners[event] = callback;
        },
        __wbg_appendChild_8204974b7328bf98: () => {
            console.log("__wbg_appendChild_8204974b7328bf98");
        },
        __wbg_axes_b1da727bd9ea422d: (arg0: any) => {
            console.log("__wbg_axes_b1da727bd9ea422d");
            return arg0.axes;
        },
        __wbg_body_942ea927546a04ba: (...args: any[]) => {
            console.log("__wbg_body_942ea927546a04ba");
            return addToExternrefTable(args[0].body);
        },
        __wbg_call_672a4d21634d4a24: (...args: any[]) => {
            console.trace("__wbg_call_672a4d21634d4a24", args);
        },
        __wbg_childNodes_c4423003f3a9441f: (...args: any[]) => {
            console.log("__wbg_childNodes_c4423003f3a9441f", args[0]);
            return Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => `node_${i}`).fill('cocaine');
        },
        __wbg_createElement_8c9931a732ee2fea: (...args: any[]) => {
            console.log("__wbg_createElement_8c9931a732ee2fea", getStringFromWasm(args[1], args[2]));
            return element;
        },
        __wbg_document_d249400bd7bd996d: () => {
            console.log("__wbg_document_d249400bd7bd996d");
            return addToExternrefTable(mockWindow.document);
        },
        __wbg_from_2a5d3e218e67aa85: (...args: any[]) => {
            console.log("__wbg_from_2a5d3e218e67aa85", args);
            return Array.from(args[0]);
        },
        __wbg_getElementById_f827f0d6648718a8: (arg0: any, arg1: any, arg2: any) => {
            const id = getStringFromWasm(arg1, arg2);
            console.log("__wbg_getElementById_f827f0d6648718a8", arg0, id);

            if (id === "canvas") return addToExternrefTable(mockCanvas);
            return addToExternrefTable({}); // TODO: whaT?
        },
        __wbg_getGamepads_1f997cef580c9088: (...args: any[]) => {
            console.log("__wbg_getGamepads_1f997cef580c9088");
            return args[0].getGamepads();
        },
        __wbg_get_67b2ba62fc30de12: (...args: any[]) => {
            console.log("__wbg_get_67b2ba62fc30de12", args[0], args[1]);
            return Reflect.get(args[0], args[1]);
        },
        __wbg_get_b9b93047fe3cf45b: (...args: any[]) => {
            console.log("__wbg_get_b9b93047fe3cf45b", args[0], args[1]);
            // const ret = arg0[arg1 >>> 0];
            return args[0][args[1] >>> 0];
        },
        __wbg_instanceof_Gamepad_365ec8404255ce00: (...args: any[]) => {
            console.log("__wbg_instanceof_Gamepad_365ec8404255ce00");
            return true;
        },
        __wbg_instanceof_HtmlCanvasElement_2ea67072a7624ac5: (...args: any[]) => {
            console.log("__wbg_instanceof_HtmlCanvasElement_2ea67072a7624ac5", args[0]);
            return true;
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            console.log("__wbg_instanceof_Window_def73ea0955fc569");
            return true;
        },
        __wbg_isTrusted_cc994b7949c53593: (...args: any[]) => {
            console.log("__wbg_isTrusted_cc994b7949c53593", args[0]);
            return true;
        },
        __wbg_item_8be407c958853a13: (...args: any[]) => {
            console.log("__wbg_item_8be407c958853a13", args[0], args[1]);
            const ret = args[0][args[1] >>> 0];
            console.log(ret);
            return addToExternrefTable(ret);
        },
        __wbg_length_49b2ba67f0897e97: (...args: any[]) => {
            console.log("__wbg_length_49b2ba67f0897e97", args[0]);
            return args[0].length;
        },
        __wbg_length_e2d2a49132c1b256: (...args: any[]) => {
            console.log("__wbg_length_e2d2a49132c1b256", args[0]);
            return args[0].length;
        },
        __wbg_movementX_1aa05f864931369b: (...args: any[]) => {
            console.log("__wbg_movementX_1aa05f864931369b", args[0]);
            return args[0].movementX;
        },
        __wbg_movementY_8acfedb38a70e624: (...args: any[]) => {
            console.log("__wbg_movementY_8acfedb38a70e624", args[0]);
            return args[0].movementY;
        },
        __wbg_navigator_1577371c070c8947: (...args: any[]) => {
            console.log("__wbg_navigator_1577371c070c8947", args[0]);
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
            console.log("__wbg_nodeType_5e1153141daac26a", arg0);
            if (arg0 === mockWindow.document) return 1;
            return 1; // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType, 1 might be it sob
        },
        __wbg_now_807e54c39636c349: () => {
            console.log("__wbg_now_807e54c39636c349");
            return Date.now();
        },
        __wbg_set_bb8cecf6a62b9f46: (...args: any[]) => {
            console.log("__wbg_set_bb8cecf6a62b9f46", args[0], args[1], args[2]);
            return Reflect.set(args[0], args[1], args[2]);
        },
        __wbg_settextContent_d29397f7b994d314: async (...args: any[]) => {
            console.log("__wbg_settextContent_d29397f7b994d314");
            element.textContent = getStringFromWasm(args[1], args[2]);

            if (!(await existsSync("out"))) await mkdir("out");
            await writeFile("out/shellshock.js", element.textContent);
        },
        __wbg_static_accessor_GLOBAL_88a902d13a557d07: (...args: any[]) => {
            console.trace("__wbg_static_accessor_GLOBAL_88a902d13a557d07", args);
        },
        __wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0: (...args: any[]) => {
            console.trace("__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0", args);
        },
        __wbg_static_accessor_SELF_37c5d418e4bf5819: (...args: any[]) => {
            console.log("__wbg_static_accessor_SELF_37c5d418e4bf5819");
            return addToExternrefTable(mockWindow);
        },
        __wbg_static_accessor_WINDOW_5de37043a91a9c40: (...args: any[]) => {
            console.log("__wbg_static_accessor_WINDOW_5de37043a91a9c40");
            return addToExternrefTable(mockWindow);
        },
        __wbg_textContent_215d0f87d539368a: (outPtr: number, targetElement: any) => {
            console.log("__wbg_textContent_215d0f87d539368a", outPtr);
            const [ptr, len] = passStringToWasm(targetElement == element ? element.textContent : "Shell Shockers and our partners");

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
            console.log("__wbindgen_string_get", arg0, arg1);
            const str = getStringFromWasm(arg0, arg1);
            const [ptr, len] = passStringToWasm(str);
            const dv = new DataView(getWasm().memory.buffer);
            dv.setInt32(arg0 + 4 * 1, len, true);
            dv.setInt32(arg0 + 4 * 0, ptr, true);
        },
        __wbindgen_is_undefined: (arg0: any) => {
            console.log("__wbindgen_is_undefined", arg0);
            return arg0 === undefined ? 1 : 0;
        },
        __wbindgen_boolean_get: (arg0: any) => {
            console.log("__wbindgen_boolean_get", arg0);
            const v = arg0;
            const ret = typeof (v) === 'boolean' ? (v ? 1 : 0) : 2;
            return ret;
        },
        __wbindgen_closure_wrapper100: (arg0: any, arg1: any, arg2: any) => {
            return makeMutClosure(arg0, arg1, 31, __wbg_adapter_22);
        },
        __wbindgen_closure_wrapper99: (arg0: any, arg1: any, arg2: any) => {
            return makeMutClosure(arg0, arg1, 31, __wbg_adapter_22);
        },
        /*imports.wbg.__wbindgen_number_get = function (arg0, arg1) {
            const obj = arg1;
            const ret = typeof (obj) === 'number' ? obj : undefined;
            getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
            getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
        };*/
        __wbindgen_number_get: (arg0: number, arg1: number) => {
            console.log("__wbingen_number_get", arg0, arg1);
            const obj = arg1;
            const ret = typeof (obj) === 'number' ? obj : undefined;
            const dv = new DataView(getWasm().memory.buffer);
            dv.setFloat64(arg0 + 8 * 1, ret!, true);
            dv.setInt32(arg0 + 4 * 0, 1, true);
        }
    }
}