import type { ChangeEvent } from "react"

type Options = {
  title: string
  value: string
}

type SelectBoxProps = {
  title: string
  options: Options[]
  placeholder?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
}

export const SelectBox = (props: SelectBoxProps) => (
  <label className="label flex justify-between">
    {props.title}
    <select className="select select-xs w-26" onChange={props.onChange}>
      <option disabled selected>{props.title ?? "Selecionar..."}</option>
      {props.options.map(i => (<option value={i.value}>{i.title}</option>))}
    </select>
  </label>
)