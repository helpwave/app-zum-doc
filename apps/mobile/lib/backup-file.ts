import type { FileInputItem } from "@helpwave/hightide-native/components"

type FileLike = {
  text: () => Promise<string>
}

function isFileLike(value: unknown): value is FileLike {
  return value != null
    && typeof value === "object"
    && "text" in value
    && typeof value.text === "function"
}

export async function readFileInputItemText(item: FileInputItem): Promise<string> {
  if (isFileLike(item.file)) {
    return item.file.text()
  }
  if (item.uri != null && item.uri.length > 0) {
    const response = await fetch(item.uri)
    if (!response.ok) {
      throw new Error("Failed to read backup file")
    }
    return response.text()
  }
  throw new Error("Failed to read backup file")
}
