import { Button, Expandable, IconButton, Input, Textarea } from '@helpwave/hightide'
import { Plus, Trash2 } from 'lucide-react'
import type { DoctorService } from '@app-zum-doc/utils/api'
import { SettingsField } from '@/components/practice/settings-field'
import { useAdministrationTranslation } from '@/i18n/useAdministrationTranslation'

function createService(): DoctorService {
  return {
    id: `service-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: '',
  }
}

function patchService(
  services: DoctorService[],
  serviceId: string,
  patch: Partial<Pick<DoctorService, 'name' | 'description' | 'url'>>
): DoctorService[] {
  return services.map((item) => {
    if (item.id !== serviceId) {
      return item
    }
    const next: DoctorService = {
      ...item,
      ...patch,
    }
    if (patch.description !== undefined && patch.description.trim().length === 0) {
      delete next.description
    }
    if (patch.url !== undefined && patch.url.trim().length === 0) {
      delete next.url
    }
    return next
  })
}

export function ServicesEditor({
  value,
  onChange,
}: {
  value: DoctorService[],
  onChange: (next: DoctorService[]) => void,
}) {
  const t = useAdministrationTranslation()

  return (
    <div className="flex-col-3 w-full">
      {value.length === 0 ? (
        <p className="text-description">{t('noServices')}</p>
      ) : (
        value.map((service) => {
          const title = service.name.trim().length > 0
            ? service.name.trim()
            : t('newService')

          return (
            <div key={service.id} className="flex-row-3 items-start w-full min-w-0">
              <Expandable
                className="min-w-0 flex-1"
                trigger={(
                  <span className="typography-label-md truncate min-w-0">
                    {title}
                  </span>
                )}
                contentProps={{ className: 'h-auto overflow-visible' }}
                contentExpandedClassName="!max-h-none"
              >
                <div className="flex-col-3 min-w-0 w-full">
                  <SettingsField label={t('serviceName')}>
                    <Input
                      className="w-full"
                      value={service.name}
                      onValueChange={(name) => {
                        onChange(patchService(value, service.id, { name }))
                      }}
                    />
                  </SettingsField>
                  <SettingsField label={t('serviceDescription')}>
                    <Textarea
                      value={service.description ?? ''}
                      rows={3}
                      onValueChange={(description) => {
                        onChange(patchService(value, service.id, { description }))
                      }}
                    />
                  </SettingsField>
                  <SettingsField label={t('serviceUrl')}>
                    <Input
                      type="url"
                      className="w-full"
                      value={service.url ?? ''}
                      onValueChange={(url) => {
                        onChange(patchService(value, service.id, { url }))
                      }}
                    />
                  </SettingsField>
                </div>
              </Expandable>
              <IconButton
                type="button"
                size="sm"
                color="negative"
                coloringStyle="text"
                tooltip={t('deleteService')}
                onClick={() => {
                  onChange(value.filter((item) => item.id !== service.id))
                }}
              >
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          )
        })
      )}
      <Button
        type="button"
        color="primary"
        coloringStyle="text"
        className="self-start !min-w-0"
        onClick={() => {
          onChange([...value, createService()])
        }}
      >
        <Plus className="size-4" />
        {t('addService')}
      </Button>
    </div>
  )
}
