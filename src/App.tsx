import { useEffect, useRef, useState } from "react"
import { FieldsetContainer } from "./components/FieldsetContainer"
import { SelectBox } from "./components/SelectBox"
import { loadGoAPI, type GoAPI } from "./wasm"

const imageFormats = [
  { title: "PNG", value: "png" },
  { title: "WEBp", value: "webp" },
  { title: "JPG", value: "jpg" },
  { title: "BMP", value: "bmp" },
]

type ImageContainerProps = {
  onImageSelected: (img: File | undefined) => void
  image?: File
}

const ImageContainer = (props: ImageContainerProps) => (
  <div className="bg-neutral-900 card card-body w-3/4 preview-box flex items-center justify-center gap-2">
    {props.image ?
      <figure className="w-full h-full p-2">
        <img
          src={URL.createObjectURL(props.image)}
          className="shadow-sm rounded-md"
          style={{ height: "-webkit-fill-available" }}
        />
      </figure>
      : undefined}
    <input
      type="file"
      accept="image/*"
      onChange={(e) => props.onImageSelected(e.target?.files?.[0])}
      className="file-input file-input-primary contain-inline"
      placeholder="Imagem..."
    />
  </div>
)

type NumericInputProps = {
  ref: React.RefObject<HTMLInputElement | null>
  placeholder: string
}

const NumericInput = (props: NumericInputProps) => (
  <input
    type="number"
    placeholder={props.placeholder}
    className="input input-xs input-secondary text-center"
    ref={props.ref}
  />
)

function App() {
  const [originalImg, setOriginalImg] = useState<File | undefined>()
  const [keepAspect, setKeepAspect] = useState<boolean>(true)
  const [isHeightAspect, setIsHeightAspect] = useState<boolean>(false)
  const [showOriginal, setShowOriginal] = useState<boolean>(true)

  const imgWidthRef = useRef<HTMLInputElement>(null)
  const imgHeightRef = useRef<HTMLInputElement>(null)

  const [, setApi] = useState<GoAPI | null>(null)
  useEffect(() => { loadGoAPI().then(setApi) }, [])

  return (
    <div className="text-base-content flex flex-1 flex-row justify-between gap-2 p-3 bg-neutral">
      <ImageContainer image={originalImg} onImageSelected={setOriginalImg} />
      <div className="bg-neutral-900 card card-body w-1/4 tool-box gap-2 justify-center">
        <h1 className="text-center font-semibold text-xl">Configurações</h1>
        <FieldsetContainer title="Tamanho" className="items-center flex flex-col">
          <div className="flex flex-row items-center gap-1.5">
            <NumericInput ref={imgWidthRef} placeholder="Largura" />
            <span className="text-2xl">x</span>
            <NumericInput ref={imgHeightRef} placeholder="Altura" />
          </div>
          <label className="label">
            Manter proporção
            <input
              type="checkbox"
              className="toggle"
              checked={keepAspect}
              onChange={() => setKeepAspect(!keepAspect)}
            />
          </label>
          <label className="label">
            <span className={keepAspect && !isHeightAspect ? "text-blue-500" : ""}>
              Largura
            </span>
            <input
              type="checkbox"
              className="toggle"
              disabled={!keepAspect}
              onChange={() => setIsHeightAspect(!isHeightAspect)}
            />
            <span className={keepAspect && isHeightAspect ? "text-blue-500" : ""}>
              Altura
            </span>
          </label>
        </FieldsetContainer>
        <FieldsetContainer title="Tipo de arquivo">
          <SelectBox title="Entrada" options={imageFormats} />
          <SelectBox title="Saída" options={imageFormats} />
        </FieldsetContainer>
        <FieldsetContainer title="Pré-visualização" className="flex-row flex justify-center">
          <button
            onClick={() => setShowOriginal(true)}
            className={"btn border-black " + (showOriginal ? "btn-secondary" : "")}
          >
            Original
          </button>
          <button
            onClick={() => setShowOriginal(false)}
            className={"btn border-black " + (!showOriginal ? "btn-secondary" : "")}
          >
            Alterações
          </button>
        </FieldsetContainer>
        <button className="btn btn-primary m-4">Exportar</button>
      </div>
    </div>
  )
}

export default App
