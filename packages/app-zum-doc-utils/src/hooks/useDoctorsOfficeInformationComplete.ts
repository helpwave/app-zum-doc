import { isDoctorsOfficeInformationComplete } from '../api/doctorsOffice'
import { useDoctorsOffice, type UseDoctorsOfficeProps } from './useDoctorsOffice'

export function useDoctorsOfficeInformationComplete(props: UseDoctorsOfficeProps) {
  const query = useDoctorsOffice(props)
  const isComplete = query.data != null
    && isDoctorsOfficeInformationComplete(query.data)
  const isIncomplete = query.data != null && !isComplete

  return {
    ...query,
    isComplete,
    isIncomplete,
  }
}
