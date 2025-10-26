//go:build js && wasm

package main

import (
	"bytes"
	"syscall/js"
)

type ConverterFunction func(data []byte)

var convertersMap = map[string]ConverterFunction{
	"jpg": JPGConverter,
	"png": PNGConverter,
}

type BinaryJS struct {
	Buf  bytes.Buffer
	done chan struct{}
}

func (c *BinaryJS) ResetData(this js.Value, args []js.Value) any {
	c.Buf = bytes.Buffer{}
	return nil
}

func (c *BinaryJS) WriteChunk(this js.Value, args []js.Value) any {
	if len(args) < 1 {
		return nil
	}
	data := make([]byte, args[0].Length())
	js.CopyBytesToGo(data, args[0])
	if len(data) == 0 {
		close(c.done)
		return nil
	}
	c.Buf.Write(data)
	return nil
}

func (c *BinaryJS) SendChunkToJS(this js.Value, args []js.Value) any {
	data := c.Buf.Bytes()
	jsBuf := js.Global().Get("UInt8Array").New(len(data))
	js.CopyBytesToJS(jsBuf, data)
	return jsBuf
}

func add(this js.Value, args []js.Value) any {
	a := args[0].Int()
	b := args[1].Int()
	return a + b
}

func hello(this js.Value, args []js.Value) any {
	name := args[0].String()
	return "Olá, " + name + "!"
}

func main() {
	println("GO worker running...")

	cache := &BinaryJS{done: make(chan struct{})}
	js.Global().Set("GoFuncs", map[string]any{
		"add":            js.FuncOf(add),
		"hello":          js.FuncOf(hello),
		"dataWriteChunk": js.FuncOf(cache.WriteChunk),
		"dataReset":      js.FuncOf(cache.ResetData),
		"dataRead":       js.FuncOf(cache.SendChunkToJS),
	})

	jsImgFormats := js.Global().Get("Array").New()
	for format := range convertersMap {
		jsImgFormats.SetIndex(jsImgFormats.Length(), js.ValueOf(format))
	}
	js.Global().Set("ImgFormats", jsImgFormats)

	select {}
}
