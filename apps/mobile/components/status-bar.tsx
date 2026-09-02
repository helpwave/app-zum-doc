import { StatusBar as ExpoStatusBar} from "expo-status-bar"
import { View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const StatusBar = () => {
  const insets = useSafeAreaInsets()

  return (
    <>
      <ExpoStatusBar style={"light"}/>
      <View 
        style={{
          pointerEvents: "none",
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          zIndex: 100,
          backgroundColor: "#00000060",
        }}
      />
    </>
  )
}