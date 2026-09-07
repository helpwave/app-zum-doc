import { HexColorUtils } from "@helpwave/hightide-design/utils"
import type { ReactNode } from "react"
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native"

type BottomSheetOverlayProps = {
  visible: boolean
  onClose: () => void
  children: ReactNode
}

export function BottomSheetOverlay({
  visible,
  onClose,
  children,
}: BottomSheetOverlayProps) {
  const screen = Dimensions.get("screen")

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      presentationStyle="overFullScreen"
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          width: screen.width,
          height: screen.height,
        }}
      >
        <Pressable
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: HexColorUtils.hexWithAlpha("#000000", 0.5),
            },
          ]}
          onPress={onClose}
        />
        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  )
}
