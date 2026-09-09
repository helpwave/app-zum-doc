import Link from 'next/link'
import {
  patientProfileFullName,
  type PracticeRequest
} from '@app-zum-doc/utils/api'
import { RequestStatusChip, RequestTypeChip } from '@/components/request-chips'

export function RequestListRow({ request }: { request: PracticeRequest }) {
  const patient = patientProfileFullName(request.patient)

  return (
    <Link
      href={`/requests/${request.id}?kind=${request.kind}`}
      className="dashboard-list-row"
    >
      <div className="dashboard-list-main">
        <span className="typography-title-sm truncate">{request.title}</span>
        <span className="text-description truncate">{patient}</span>
      </div>
      <div className="flex-row-2 items-center shrink-0">
        <RequestTypeChip kind={request.kind} />
        <RequestStatusChip status={request.status} />
      </div>
    </Link>
  )
}
