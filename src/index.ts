// to change the version of the WASM just change "newest" to the version you want to use
import { readFile } from "fs/promises";
import { imports } from "../wasm/newest/imports";
import { type iWasmExports } from "../wasm/newest/imports";
import { getStringFromWasm, passStringToWasm } from "./utils";
const wasmBytes = await readFile(new URL("../wasm/newest/wasm_loader.wasm", import.meta.url));

const wasm = await WebAssembly.instantiate(wasmBytes, imports);
const exports = wasm.instance.exports as unknown as iWasmExports;

export const getWasm = (): iWasmExports => {
    return exports;
}

export const process = (str: string) => {
    const [ptr, len] = passStringToWasm(str);
    exports.process(ptr, len);
}

export const validate = (input: string) => {
    let retPtr: number;
    let retLen: number;

    try {
        const [ptr, len] = passStringToWasm(input);
        const ret = exports.validate(ptr, len);

        retPtr = ret[0];
        retLen = ret[1];
        return getStringFromWasm(retPtr, retLen);
    } finally {
        exports.__wbindgen_free(retPtr!, retLen!, 1);
    }
}

// NOTE: all the imports will log their name when they are called, this can help with seeing what the WASM is doing.

// this will output the transformed normal js code to out/shellshock.js
// const { data } = await axios.get("https://shellshock.io/js/shellshock.js?" + Date.now());
// process(data);

// outputs the result of wasm.validate (window.validate)
// console.log(`validate("test"): ${validate("test")}`);

// runs wasm.start not 100% sure what it does
// exports.start();