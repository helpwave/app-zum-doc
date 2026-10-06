import { AppBar } from "@/components/app-bar"
import { useAppTranslation } from "@/hooks/useAppTranslation"
import { useAzdTheme } from "@/hooks/useAzdTheme"
import { licenseDocument } from "@/generated/licenses"
import type { PackageCredit } from "@app-zum-doc/license-check"
import { ThemedText } from "@helpwave/hightide-native/components"
import { useLocalSearchParams } from "expo-router"
import { Linking, Pressable, ScrollView, View } from "react-native"

function searchParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }
  return value ?? ""
}

function findPackage(name: string, version: string) {
  return licenseDocument.packages.find((entry) => {
    return entry.name === name && entry.version === version
  })
}

type PackageLinkProps = {
  label: string
  url: string
}

function PackageLink({ label, url }: PackageLinkProps) {
  const { theme } = useAzdTheme()

  return (
    <Pressable
      onPress={() => {
        void Linking.openURL(url)
      }}
    >
      <ThemedText
        style={{
          ...theme.typography.body.md,
          color: theme.colors.primary.color,
        }}
      >
        {label}
      </ThemedText>
    </Pressable>
  )
}

type LicenseBodyProps = {
  credit: PackageCredit
}

function LicenseBody({ credit }: LicenseBodyProps) {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()

  return (
    <View style={{ gap: theme.spacing.lg }}>
      <View style={{ gap: theme.spacing.xs }}>
        <ThemedText
          style={{
            ...theme.typography.heading.md,
            fontWeight: theme.fontWeights.bold,
          }}
        >
          {credit.name}
        </ThemedText>
        <ThemedText appearance="description" style={theme.typography.body.md}>
          {credit.version}
        </ThemedText>
      </View>
      {credit.url ? <PackageLink label={t("packageHomepage")} url={credit.url} /> : null}
      {credit.repository ? <PackageLink label={t("packageRepository")} url={credit.repository} /> : null}
      {credit.licenseIds.map((licenseId) => {
        const license = licenseDocument.licenses[licenseId]
        return (
          <View key={licenseId} style={{ gap: theme.spacing.sm }}>
            <ThemedText
              style={{
                ...theme.typography.body.md,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              {license?.name ?? licenseId}
            </ThemedText>
            {license?.text ? (
              <ThemedText appearance="description" style={theme.typography.body.md}>
                {license.text}
              </ThemedText>
            ) : null}
          </View>
        )
      })}
    </View>
  )
}

export default function LicenseDetailScreen() {
  const t = useAppTranslation()
  const { theme } = useAzdTheme()
  const params = useLocalSearchParams<{ name?: string | string[], version?: string | string[] }>()
  const credit = findPackage(searchParam(params.name), searchParam(params.version))

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background.color,
      }}
    >
      <AppBar title={t("licenses")} />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
        }}
      >
        {credit ? (
          <LicenseBody credit={credit} />
        ) : (
          <ThemedText appearance="description" style={theme.typography.body.md}>
            {t("licenseNotFound")}
          </ThemedText>
        )}
      </ScrollView>
    </View>
  )
}
