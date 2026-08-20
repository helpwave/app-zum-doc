import { VirtualList } from "@/components/virtual-list"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import {
    IconButton,
    ListActionItem,
    SearchBar,
    ThemedIcon,
    ThemedText,
} from "@helpwave/hightide-native/components"
import type { LucideIcon } from "lucide-react-native"
import { Check, TrashIcon } from "lucide-react-native"
import { ActivityIndicator, Modal, Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export type FilterSearchOption = {
  id: string
  label: string
}

type FilterSearchSheetProps = {
  visible: boolean
  title: string
  placeholder: string
  search: string
  onSearchChange: (value: string) => void
  items: readonly FilterSearchOption[]
  isPending: boolean
  selectedId?: string
  leadingIcon: LucideIcon
  onSelect: (id: string) => void
  onClear: () => void
  onClose: () => void
}

export function FilterSearchSheet({
  visible,
  title,
  placeholder,
  search,
  onSearchChange,
  items,
  isPending,
  selectedId,
  leadingIcon,
  onSelect,
  onClear,
  onClose,
}: FilterSearchSheetProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const insets = useSafeAreaInsets()
  const tonalPrimary = theme.semantics.coloringColorVariant({
    colorPair: theme.colors.primary,
    variant: "tonal",
  })
  const showInitialLoading = isPending && items.length === 0

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: theme.semantics.withAppearance({
            color: "#000000",
            appearance: "faded",
          }),
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(event) => event.stopPropagation()}
          style={{
            backgroundColor: theme.colors.surface.color,
            borderTopLeftRadius: theme.borderRadius.xxl,
            borderTopRightRadius: theme.borderRadius.xxl,
            paddingBottom: insets.bottom + theme.spacing.lg,
            maxHeight: "90%",
          }}
        >
          <View
            style={{
              alignItems: "center",
              paddingTop: theme.spacing.md,
              paddingBottom: theme.spacing.lg,
            }}
          >
            <View
              style={{
                width: 40,
                height: theme.spacing.sm,
                borderRadius: 9999,
                backgroundColor: theme.colors.neutral.color,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: theme.spacing.lg,
              marginBottom: theme.spacing.lg,
            }}
          >
            <View style={{ width: theme.semantics.control.sm.size }} />
            <ThemedText
              style={{
                ...theme.typography.heading.md,
                fontWeight: theme.fontWeights.bold,
                textAlign: "center",
                flex: 1,
              }}
            >
              {title}
            </ThemedText>
            <View
              style={{
                width: theme.semantics.control.sm.size,
                alignItems: "flex-end",
              }}
            >
              {selectedId ? (
                <IconButton
                  icon={TrashIcon}
                  size="sm"
                  variant="foreground"
                  color={theme.colors.negative}
                  accessibilityLabel={t("clearSelection")}
                  onPress={() => {
                    onClear()
                    onClose()
                  }}
                />
              ) : null}
            </View>
          </View>
          <View style={{ paddingHorizontal: theme.spacing.lg }}>
            <SearchBar
              value={search}
              placeholder={placeholder}
              onValueChange={onSearchChange}
              onSearch={onSearchChange}
            />
          </View>
          {showInitialLoading ? (
            <View
              style={{
                paddingVertical: theme.spacing.xxl,
                alignItems: "center",
              }}
            >
              <ActivityIndicator color={theme.colors.primary.color} />
            </View>
          ) : items.length === 0 ? (
            <ThemedText
              appearance="description"
              style={{
                ...theme.typography.body.md,
                textAlign: "center",
                paddingHorizontal: theme.spacing.lg,
                paddingVertical: theme.spacing.xl,
              }}
            >
              {t("noSearchResults")}
            </ThemedText>
          ) : (
            <VirtualList
              data={[...items]}
              keyExtractor={(item) => item.id}
              style={{ marginTop: theme.spacing.md }}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedId
                return (
                  <ListActionItem
                    title={item.label}
                    color={isSelected ? theme.colors.primary : undefined}
                    itemStyle={(previous) => ({
                      ...previous,
                      backgroundColor: isSelected
                        ? tonalPrimary.color
                        : previous.backgroundColor,
                    })}
                    leading={<ThemedIcon icon={leadingIcon} />}
                    trailing={isSelected ? <ThemedIcon icon={Check} /> : undefined}
                    onPress={() => {
                      onSelect(item.id)
                      onClose()
                    }}
                  />
                )
              }}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
