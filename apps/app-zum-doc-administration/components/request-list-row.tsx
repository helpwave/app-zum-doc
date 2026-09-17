import {
  patientProfileFullName,
  type PracticeRequest
} from '@app-zum-doc/utils/api'
import { RequestStatusChip } from '@/components/request-chips'
import { ActionCard } from '@helpwave/hightide'

export function RequestListRow({
  request,
  onSelect,
}: {
  request: PracticeRequest,
  onSelect: (requestId: string) => void,
}) {
  const patient = patientProfileFullName(request.patient)

  return (
    <ActionCard
      title={request.title}
      description={patient}
      onClick={() => onSelect(request.id)}
      trailing={<RequestStatusChip status={request.status} />}
    />
  )
}
