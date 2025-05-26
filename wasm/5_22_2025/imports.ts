import { mkdir } from "fs/promises";
import { addToExternrefTable, getStringFromWasm } from "../../src/utils";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";

// they removed their "anticheat" attempt! 🎉

export interface iWasmExports {
    closure30_externref_shim(arg0: any, arg1: any, arg2: any): unknown;
    __wbindgen_export_5: any;
    memory: WebAssembly.Memory;
    process: (ptr: number, len: number) => void;
    start: () => void;
    validate: (ptr: number, len: number) => [number, number]; // sha256 with a salt?
    __externref_table_alloc: () => number;
    __wbindgen_exn_store: () => void;
    __wbindgen_export_2: WebAssembly.Table;
    __wbindgen_free: (ptr: number, len: number, align: number) => void;
    __wbindgen_malloc: (len: number, align: number) => number;
    __wbindgen_realloc: () => void;
    __wbindgen_start: () => void;
}

const mockWindow = {
    document: {
        body: {},
    }
}

const element = {
    textContent: "",
}

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
        __wbg_createElement_8c9931a732ee2fea: (...args: any[]) => {
            console.log("__wbg_createElement_8c9931a732ee2fea", getStringFromWasm(args[1], args[2]));
            return element;
        },
        __wbg_document_d249400bd7bd996d: () => {
            console.log("__wbg_document_d249400bd7bd996d");
            return addToExternrefTable(mockWindow.document);
        },
        __wbg_instanceof_Window_def73ea0955fc569: () => {
            console.log("__wbg_instanceof_Window_def73ea0955fc569");
            return true;
        },
        __wbg_newnoargs_105ed471475aaf50: () => {
            console.trace("__wbg_newnoargs_105ed471475aaf50");
        },
        __wbg_now_807e54c39636c349: () => {
            console.log("__wbg_now_807e54c39636c349");
            return Date.now();
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
            return addToExternrefTable(mockWindow);
        },
        __wbindgen_debug_string: (...args: any[]) => {
            console.trace("__wbindgen_debug_string", args);
        },
        __wbindgen_init_externref_table: (...args: any[]) => {
            console.trace("__wbindgen_init_externref_table", args);
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