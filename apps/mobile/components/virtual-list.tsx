import { FlatList, type FlatListProps } from "react-native"

export function VirtualList<TItem>(props: FlatListProps<TItem>) {
  return <FlatList keyboardShouldPersistTaps="handled" {...props} />
}
