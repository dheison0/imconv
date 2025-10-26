import type { ReactElement } from "react"

type FieldsetContainerProps = {
  title: string
  children?: ReactElement[]
  className?: string
}

export const FieldsetContainer = (props: FieldsetContainerProps) => (
  <fieldset className={"fieldset rounded-box border p-4 gap-2 border-zinc-600 " + (props.className ?? "")}>
    <legend className="fieldset-legend">{props.title}</legend>
    {props.children}
  </fieldset>
)