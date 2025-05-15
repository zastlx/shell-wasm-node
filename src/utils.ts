import { getWasm } from ".";

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

export const getStringFromWasm = (ptr: number, len: number, wasm: iWasmExports): string => {
    ptr = ptr >>> 0;
    return (new TextDecoder()).decode((new Uint8Array(wasm.memory.buffer)).subarray(ptr, ptr + len));
}

export const passStringToWasm = (str: string, wasm: iWasmExports): [number, number] => {
    const buf = (new TextEncoder()).encode(str);
    const ptr = wasm.__wbindgen_malloc(buf.length, 1) >>> 0;
    (new Uint8Array(wasm.memory.buffer)).subarray(ptr, ptr + buf.length).set(buf);
    return [ptr, buf.length];
}

export const addToExternrefTable = (obj: any, wasm: iWasmExports) => {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_export_2.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => { }, unregister: () => { } }
    : new FinalizationRegistry((state: any) => {
        getWasm().__wbindgen_export_5.get(state.dtor)(state.a, state.b)
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