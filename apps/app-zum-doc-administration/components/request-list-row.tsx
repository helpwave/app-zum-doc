import clsx from 'clsx'
import {
  patientProfileFullName,
  type PracticeRequest
} from '@app-zum-doc/utils/api'
import {
  listRowClassName,
  listRowMainClassName
} from '@/components/dashboard/list-row'
import { RequestStatusChip } from '@/components/request-chips'

export function RequestListRow({
  request,
  onSelect,
}: {
  request: PracticeRequest,
  onSelect: (requestId: string) => void,
}) {
  const patient = patientProfileFullName(request.patient)

  return (
    <button
      type="button"
      className={clsx(listRowClassName, 'text-left')}
      onClick={() => onSelect(request.id)}
    >
      <div className={listRowMainClassName}>
        <span className="typography-title-sm truncate">{request.title}</span>
        <span className="text-description truncate">{patient}</span>
      </div>
      <RequestStatusChip status={request.status} />
    </button>
  )
}
