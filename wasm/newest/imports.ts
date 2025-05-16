import { mkdir } from "fs/promises";
import { getWasm } from "../../src/index";
import { addToExternrefTable, getStringFromWasm, passStringToWasm } from "../../src/utils";
import { writeFile } from "fs/promises";
import { existsSync } from "fs";

export interface iWasmExports {
    memory: WebAssembly.Memory;
    process: (ptr: number, len: number) => void;
    start: () => void;
    validate: (ptr: number, len: number) => [number, number]; // sha256 with a salt?
    verify: () => void;
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
                toString: () => {
                    console.log("call toStr");
                    return "[object HTMLParagraphElement]";
                },
                valueOf: function () { console.log("call valueOf"); return this; },
            }, {
                get: (target: Record<string, any>, prop: string) => {
                    // console.log("access", prop, target, target[prop]);
                    console.trace("acess", prop);

                    if (prop.toString().includes("toStringTag")) {
                        console.log("toStrTag")
                        return () => "HTMLParagraphElement";
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
            return 1;// return 132; // amount of p elements on shell without any guis, dunno if this actually matters
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
            const [ptr, len] = passStringToWasm(element.textContent);

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
        __wbindgen_is_undefined: (...args: any[]) => {
            console.log("__wbindgen_is_undefined");
            return args[0] === undefined;
        },
        __wbindgen_throw: (...args: any[]) => {
            console.trace("__wbindgen_throw", args);
        },
    }
}