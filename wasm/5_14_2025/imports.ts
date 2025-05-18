// the version of imports.ts for 5_14_2025 wasm
import { mkdir } from "fs/promises";
import { getWasm } from "../../src/index";
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from "../../src/utils";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";

export interface iWasmExports {
    closure28_externref_shim: (a: any, b: any, c: any) => void;
    memory: WebAssembly.Memory;
    process: (ptr: number, len: number) => void;
    start: () => void;
    validate: (ptr: number, len: number) => [number, number]; // sha256 with a salt?
    verify: () => void;
    __externref_table_alloc: () => number;
    __wbindgen_exn_store: () => void;
    __wbindgen_export_2: WebAssembly.Table;
    __wbindgen_export_5: WebAssembly.Table;
    __wbindgen_free: (ptr: number, len: number, align: number) => void;
    __wbindgen_malloc: (len: number, align: number) => number;
    __wbindgen_realloc: () => void;
    __wbindgen_start: () => void;
    _dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h573d6777e73915f0: (a: any, b: any) => void; // so aids
}

// only for this version so moved here
const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry((state: any) => {
        (getWasm() as iWasmExports).__wbindgen_export_5.get(state.dtor)(state.a, state.b)
    });

// this seems to be used to run a function in the wasm from js, e.g a callback
export const makeMutClosure = (arg0: any, arg1: any, dtor: any, f: any, wasm: iWasmExports) => {
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
                wasm.__wbindgen_export_5.get(state.dtor)(a, state.b);
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

const mockWindow = {
    queueMicrotask: (fn: () => void) => {
        console.log("window.queueMicrotask called with", fn);
        // if this is not commented out it calls setTimeout and loops over all "p" elements and checks "Shell Shockers" and will set href if it doesn't find it
        fn();
    },
    document: {
        body: {},
        currentScript: {}
    }
}

const element = {
    textContent: ""
};

// the mock implementation of all the imports passed to the wasm
export const imports = {
    wbg: {
        __wbg_appendChild_8204974b7328bf98: () => {
            console.log("__wbg_appendChild_8204974b7328bf98");
        },
        __wbg_body_942ea927546a04ba: (...args: any[]) => {
            console.log("__wbg_body_942ea927546a04ba");
            return addToExternrefTable(args[0].body);
        },
        __wbg_call_672a4d21634d4a24: (...args: any[]) => {
            console.trace("__wbg_call_672a4d21634d4a24", args);
        },
        __wbg_clearTimeout_5a54f8841c30079a: (...args: any[]) => {
            console.log("__wbg_clearTimeout_5a54f8841c30079a");
            clearTimeout(args[0]);
        },
        __wbg_createElement_8c9931a732ee2fea: (...args: any[]) => {
            console.log("__wbg_createElement_8c9931a732ee2fea", getStringFromWasm(args[1], args[2]));
            return element;
        },
        __wbg_currentScript_696dfba63dbe2fbe: (...args: any[]) => {
            console.log("__wbg_currentScript_696dfba63dbe2fbe");
            return addToExternrefTable(args[0].currentScript);
        },
        __wbg_document_d249400bd7bd996d: () => {
            console.log("__wbg_document_d249400bd7bd996d");
            return addToExternrefTable(mockWindow.document);
        },
        __wbg_get_e27dfaeb6f46bd45: () => {
            console.log("__wbg_get_e27dfaeb6f46bd45");
            return new Proxy({
                toString: () => "test",
                valueOf: () => "test",
            }, {
                get: (target: Record<string, any>, prop: string) => {
                    if (prop.toString().includes("Symbol")) {
                        return (hint: string) => {
                            if (hint === "number") return 5;
                        }
                    }
                    return target[prop];
                }
            });
        },
        __wbg_instanceof_Element_0af65443936d5154: () => {
            console.log("__wbg_instanceof_Element_0af65443936d5154");
            return true;
        },
        __wbg_instanceof_HtmlScriptElement_2e62e6b65dda86a4: (...args: any[]) => {
            console.log("__wbg_instanceof_HtmlScriptElement_2e62e6b65dda86a4");
            return args[0] === mockWindow.document.currentScript;
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            console.log("__wbg_instanceof_Window_def73ea0955fc569");
            return true;
        },
        __wbg_length_49b2ba67f0897e97: () => {
            console.log("__wbg_length_49b2ba67f0897e97");
            return 1; // have the loop fire the least amount of times as possible for best efficiency
        },
        __wbg_location_350d99456c2f3693: () => {
            const location = {};
            return location;
        },
        __wbg_newnoargs_105ed471475aaf50: () => {
            console.trace("__wbg_newnoargs_105ed471475aaf50");
        },
        __wbg_now_807e54c39636c349: () => {
            console.log("__wbg_now_807e54c39636c349");
            return Date.now();
        },
        __wbg_querySelectorAll_40998fd748f057ef: (...args: any[]) => {
            const query = getStringFromWasm(args[1], args[2]);
            console.log(`__wbg_querySelectorAll_40998fd748f057ef called with ${query}`);
            return [];
        },
        __wbg_queueMicrotask_97d92b4fcc8a61c5: (...args: any[]) => {
            console.log("__wbg_queueMicrotask_97d92b4fcc8a61c5");
            mockWindow.queueMicrotask(args[0]);
        },
        __wbg_queueMicrotask_d3219def82552485: (...args: any[]) => {
            console.log("__wbg_queueMicrotask_d3219def82552485");
            return args[0].queueMicrotask;
        },
        __wbg_resolve_4851785c9c5f573d: (...args: any[]) => {
            console.log("__wbg_resolve_4851785c9c5f573d");
            return Promise.resolve(args[0]);
        },
        __wbg_setTimeout_db2dbaeefb6f39c7: (...args: any[]) => {
            console.log("__wbg_setTimeout_db2dbaeefb6f39c7 with timeout", args[1]);
            return setTimeout(args[0], args[1]); // change args[1] to a lower number to have the next checks run sooner (this goes in a loop a decent amount of times before it exist) goes from the timeout being 10000ms to 30000ms finally to 60000ms and then exits.
        },
        __wbg_sethref_7eb69a6b9ae98056: (...args: any[]) => {
            console.log("__wbg_sethref_7eb69a6b9ae98056");
            console.trace();
            const targetHref = getStringFromWasm(args[1], args[2]);
            console.log("attempted to redirect to", targetHref);
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
            console.trace("__wbg_static_accessor_WINDOW_5de37043a91a9c40", args);
        },
        __wbg_textContent_215d0f87d539368a: (outPtr: number, targetElement: any) => {
            console.log("__wbg_textContent_215d0f87d539368a");
            const [ptr, len] = passStringToWasm(targetElement == element ? element.textContent : "Shell Shockers");

            const dv = new DataView((getWasm() as iWasmExports).memory.buffer);
            dv.setInt32(outPtr + 4 * 1, len, true);
            dv.setInt32(outPtr + 4 * 0, ptr, true);
        },
        __wbg_then_44b73946d2fb3e7d: (...args: any[]) => {
            console.trace("__wbg_then_44b73946d2fb3e7d", args);
        },
        __wbindgen_cb_drop: (...args: any[]) => {
            console.log("__wbindgen_cb_drop");
            const obj = args[0].original;
            if (obj.cnt-- == 1) {
                obj.a = 0;
                return true;
            }

            return false;
        },
        __wbindgen_closure_wrapper281: (...args: any[]) => {
            console.log("__wbindgen_closure_wrapper281");
            return makeMutClosure(args[0], args[1], 22, (...args: any[]) => {
                (getWasm() as iWasmExports)._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h573d6777e73915f0(args[0], args[1]);
            }, (getWasm() as iWasmExports));
        },
        __wbindgen_closure_wrapper295: (...args: any[]) => {
            console.log("__wbindgen_closure_wrapper295");
            return makeMutClosure(args[0], args[1], 29, (...args: any[]) => {
                (getWasm() as iWasmExports).closure28_externref_shim(args[0], args[1], args[2]);
            }, (getWasm() as iWasmExports));
        },
        __wbindgen_debug_string: (...args: any[]) => {
            console.trace("__wbindgen_debug_string", args);
        },
        __wbindgen_init_externref_table: (...args: any[]) => {
            console.trace("__wbindgen_init_externref_table", args);
        },
        __wbindgen_is_function: (...args: any[]) => {
            console.log("__wbindgen_is_function");
            return typeof args[0] === "function";
        },
        __wbindgen_is_undefined: (...args: any[]) => {
            console.log("__wbindgen_is_undefined");
            return args[0] === undefined;
        },
        __wbindgen_throw: (...args: any[]) => {
            console.trace("__wbindgen_throw", args);
        },
    }
}