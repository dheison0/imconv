/* eslint-disable @typescript-eslint/no-explicit-any */
import "./assets/wasm_exec.js";

let loadingAPI = false;

export interface GoAPI { // FIXME: Define WASM functions here
  add(a: number, b: number): number;
  hello(name: string): string;
  dataWriteChunk(data: Uint8Array): void;
  dataReset(): void;
  dataRead(): Uint8Array;
}

export async function loadGoAPI(): Promise<GoAPI> {
  if (loadingAPI) {
    while (loadingAPI) {
      await new Promise(resolve => setTimeout(resolve, 10));
    };
    return registryGoAPI();
  };
  loadingAPI = true;
  console.info("Loading Go API...");
  const go = new (window as any).Go(); // from wasm_exec.js
  const wasm = await WebAssembly.instantiateStreaming(fetch("/mod.wasm.gz"), go.importObject);
  go.run(wasm.instance);
  console.info("Go API loaded.");
  loadingAPI = false;
  return registryGoAPI();
}

function goProtectedCallWrapper<T extends (...args: any) => any>(f: T) {
  return function (...args: Parameters<T>): ReturnType<T> {
    try {
      return f(...args);
    } catch (e) {
      console.warn("Recovering mod from panic...");
      (window as any).GoFuncs = undefined;
      Promise.resolve(loadGoAPI());
      throw e;
    }
  }
}

export function registryGoAPI(): GoAPI {
  const GoFuncs = (window as any).GoFuncs;
  return { // FIXME: Associate functions
    add: goProtectedCallWrapper(GoFuncs.add),
    hello: goProtectedCallWrapper(GoFuncs.hello),
    dataWriteChunk: goProtectedCallWrapper(GoFuncs.dataWriteChunk),
    dataReset: goProtectedCallWrapper(GoFuncs.dataReset),
    dataRead: goProtectedCallWrapper(GoFuncs.dataRead),
  };
}
