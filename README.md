# shell-wasm-node
a compatibility layer to run ShellShocker's WASM file in Node/Bun

## Usage
first you probably want to uncomment one of the function calls in `src/index.ts` to run some of the exports from the wasm file, e.g `process` which will output the transformed normal js code to `out/shellshock.js`    
feel free to browse the code, Happy Reversing!

### Bun
```bash
bun .
```

### Node
```bash
node --run startNode
```

# DMCA
parts of this repository contain JavaScript code and WebAssembly files that come from data contained in Shell Shockers.    
per [section 117](https://www.copyright.gov/reports/studies/dmca/sec-104-report-vol-1.pdf) of the DMCA, this repository is an archive and should not be subject to takedown.    
a false DMCA is considered illegal.