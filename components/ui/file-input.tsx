"use client"

import type React from "react"

import { useState } from "react"
import { Input, type InputProps } from "@/components/ui/input"

interface FileInputProps extends Omit<InputProps, "type" | "onChange" | "value"> {
  onChange: (files: FileList | null) => void
  accept?: string
  multiple?: boolean
}

export function FileInput({ onChange, accept, multiple = false, ...props }: FileInputProps) {
  const [fileName, setFileName] = useState<string>("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    onChange(files)

    if (files && files.length > 0) {
      if (files.length === 1) {
        setFileName(files[0].name)
      } else {
        setFileName(`${files.length} files selected`)
      }
    } else {
      setFileName("")
    }
  }

  return (
    <div className="relative">
      <Input type="file" onChange={handleChange} accept={accept} multiple={multiple} {...props} />
      {fileName && <div className="mt-1 text-sm text-muted-foreground">Selected: {fileName}</div>}
    </div>
  )
}

