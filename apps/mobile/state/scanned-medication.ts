import type { MedicationCatalogItem } from "@app-zum-doc/utils/api"
import { useSyncExternalStore } from "react"

type ScannedMedicationResult = {
  item: MedicationCatalogItem | null
}

let scannedMedication: ScannedMedicationResult | null = null
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) {
    listener()
  }
}

export function setScannedMedication(item: MedicationCatalogItem | null) {
  scannedMedication = item == null ? null : { item }
  emit()
}

export function setScannedMedicationNotFound() {
  scannedMedication = { item: null }
  emit()
}

export function useScannedMedication() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => scannedMedication,
    () => null,
  )
}
