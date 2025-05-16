import { getWasm } from ".";

export const getStringFromWasm = (ptr: number, len: number): string => {
    ptr = ptr >>> 0;
    return (new TextDecoder()).decode((new Uint8Array(getWasm().memory.buffer)).subarray(ptr, ptr + len));
}

export const passStringToWasm = (str: string): [number, number] => {
    const buf = (new TextEncoder()).encode(str);
    const ptr = getWasm().__wbindgen_malloc(buf.length, 1) >>> 0;
    (new Uint8Array(getWasm().memory.buffer)).subarray(ptr, ptr + buf.length).set(buf);
    return [ptr, buf.length];
}

export const addToExternrefTable = (obj: any) => {
    const idx = getWasm().__externref_table_alloc();
    getWasm().__wbindgen_export_2.set(idx, obj);
    return idx;
}
