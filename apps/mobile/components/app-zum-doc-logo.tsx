import { useEffect, useId, useRef } from "react"
import {
  Animated,
  Easing,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import Svg, { ClipPath, Defs, G, Path } from "react-native-svg"

const backFillPath: string = "M33.1817 37.511L29.7804 37.511C21.7695 37.511 15.2754 44.0051 15.2754 52.016C15.2754 60.0268 21.7695 66.5209 29.7804 66.5209H35.4017C35.4208 66.5209 35.4274 66.5239 35.4301 66.5251C35.436 66.5275 35.4456 66.5331 35.4559 66.5434C35.4662 66.5536 35.4717 66.5633 35.4742 66.5691C35.4754 66.5719 35.4783 66.5785 35.4783 66.5975L35.4783 72.852C35.4783 80.8628 41.9724 87.3569 49.9833 87.3569C57.9942 87.3569 64.4883 80.8628 64.4883 72.852L64.4883 54.7684C64.4883 45.2374 56.7619 37.511 47.2309 37.511L43.6515 37.511V42.1072L47.2309 42.1072C54.2235 42.1072 59.8921 47.7758 59.8921 54.7684V72.852C59.8921 78.3244 55.4558 82.7608 49.9833 82.7608C44.5108 82.7608 40.0745 78.3244 40.0745 72.852L40.0745 66.5975C40.0745 64.0168 37.9824 61.9248 35.4017 61.9248L29.7804 61.9248C24.3079 61.9248 19.8716 57.4884 19.8716 52.016C19.8716 46.5435 24.3079 42.1072 29.7804 42.1072L33.1817 42.1072V37.511Z"
const frontFillPath: string = "M65.0734 29.3412C65.0734 21.3303 58.5793 14.8362 50.5685 14.8362C42.5576 14.8362 36.0635 21.3303 36.0635 29.3412V47.4247C36.0635 56.9557 43.7899 64.6821 53.3209 64.6821H57.4673V60.086H53.3209C46.3283 60.086 40.6597 54.4173 40.6597 47.4247V29.3412C40.6597 23.8687 45.096 19.4324 50.5685 19.4324C56.0409 19.4324 60.4773 23.8687 60.4773 29.3412V35.5956C60.4773 38.1763 62.5693 40.2684 65.15 40.2684H70.7714C76.2439 40.2684 80.6802 44.7047 80.6802 50.1772C80.6802 55.6496 76.2439 60.086 70.7714 60.086H66.7949V64.6821H70.7714C78.7823 64.6821 85.2764 58.188 85.2764 50.1772C85.2764 42.1663 78.7823 35.6722 70.7714 35.6722H65.15C65.131 35.6722 65.1244 35.6692 65.1216 35.668C65.1158 35.6656 65.1061 35.66 65.0959 35.6497C65.0856 35.6395 65.08 35.6298 65.0776 35.624L65.0775 35.6238C65.0763 35.6209 65.0734 35.6142 65.0734 35.5956V29.3412Z"
const backStrokePath: string = "M43.65 39.81 L47.23 39.81 A14.96 14.96 0 0 1 62.19 54.77 L62.19 72.85 A12.21 12.21 0 0 1 37.78 72.85 L37.78 66.6 Q37.78 64.22 35.4 64.22 L29.78 64.22 A12.21 12.21 0 0 1 29.78 39.81 L33.18 39.81"
const frontStrokePath: string = "M57.47 62.38 L53.32 62.38 A14.96 14.96 0 0 1 38.36 47.42 L38.36 29.34 A12.21 12.21 0 0 1 62.78 29.34 L62.78 35.6 Q62.78 37.97 65.15 37.97 L70.77 37.97 A12.21 12.21 0 0 1 70.77 62.38 L66.79 62.38"

const backStrokeLength: number = 141
const frontStrokeLength: number = 143
const hiddenStrokeRatio: number = 1.005
const cssEaseIn = Easing.bezier(0.42, 0, 1, 1)

const AnimatedPath = Animated.createAnimatedComponent(Path)

export type AppZumDocLogoAnimation = "none" | "loading"

export type AppZumDocLogoProps = {
  width?: number
  height?: number
  frontColor?: string
  backColor?: string
  animate?: AppZumDocLogoAnimation
  animationDuration?: number
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export function AppZumDocLogo({
  width = 64,
  height = 64,
  frontColor = "#095763",
  backColor = "#4E97A2",
  animate = "none",
  animationDuration = 1.7,
  style,
  accessibilityLabel,
}: AppZumDocLogoProps) {
  const clipId: string = useId().replace(/[^a-zA-Z0-9]/g, "")
  const progress = useRef(new Animated.Value(0)).current
  const isLoadingAnimation: boolean = animate === "loading"

  useEffect(() => {
    if (!isLoadingAnimation) {
      return
    }
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: animationDuration * 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    )
    animation.start()
    return () => {
      animation.stop()
      progress.setValue(0)
    }
  }, [animationDuration, isLoadingAnimation, progress])

  const backDashOffset = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [backStrokeLength * hiddenStrokeRatio, 0, 0],
    easing: cssEaseIn,
  })

  const frontDashOffset = progress.interpolate({
    inputRange: [0, 0.33, 0.73, 1],
    outputRange: [
      frontStrokeLength * hiddenStrokeRatio,
      frontStrokeLength * hiddenStrokeRatio,
      0,
      0,
    ],
    easing: cssEaseIn,
  })

  return (
    <Svg
      width={width}
      height={height}
      viewBox="14 14 72 74"
      fill="none"
      style={style}
      accessibilityRole={isLoadingAnimation ? "progressbar" : "image"}
      accessibilityLabel={accessibilityLabel}
    >
      {isLoadingAnimation ? (
        <>
          <Defs>
            <ClipPath id={`${clipId}back`}>
              <Path d={backFillPath} />
            </ClipPath>
            <ClipPath id={`${clipId}front`}>
              <Path d={frontFillPath} />
            </ClipPath>
          </Defs>
          <G clipPath={`url(#${clipId}back)`}>
            <AnimatedPath
              d={backStrokePath}
              stroke={backColor}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={[backStrokeLength, backStrokeLength * 2]}
              strokeDashoffset={backDashOffset}
            />
          </G>
          <G clipPath={`url(#${clipId}front)`}>
            <AnimatedPath
              d={frontStrokePath}
              stroke={frontColor}
              strokeWidth={7}
              strokeLinecap="round"
              strokeDasharray={[frontStrokeLength, frontStrokeLength * 2]}
              strokeDashoffset={frontDashOffset}
            />
          </G>
        </>
      ) : (
        <>
          <Path fillRule="evenodd" clipRule="evenodd" d={backFillPath} fill={backColor} />
          <Path fillRule="evenodd" clipRule="evenodd" d={frontFillPath} fill={frontColor} />
        </>
      )}
    </Svg>
  )
}
