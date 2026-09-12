function practiceInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function profilePictureSrc(imageUri: string): string | undefined {
  if (!imageUri.trim()) {
    return undefined
  }
  if (imageUri === 'doctor-portrait') {
    return '/images/doctor-portrait.png'
  }
  if (imageUri === 'practice-logo') {
    return '/images/practice-logo.png'
  }
  if (
    imageUri.startsWith('data:')
    || imageUri.startsWith('http://')
    || imageUri.startsWith('https://')
    || imageUri.startsWith('/')
  ) {
    return imageUri
  }
  return undefined
}

export function ProfilePictureField({
  label,
  imageUri,
  name,
  onFileSelected,
}: {
  label: string,
  imageUri: string,
  name: string,
  onFileSelected: (imageUri: string) => void,
}) {
  const src = profilePictureSrc(imageUri)

  return (
    <label className="flex-col-1 w-full min-w-0">
      <span className="w-40 shrink-0 typography-label-md">{label}</span>
      <div className="flex-row-3 items-center min-w-0">
        {src ? (
          <img
            src={src}
            alt=""
            className="size-16 shrink-0 rounded-full object-cover bg-surface-secondary"
          />
        ) : (
          <div className="size-16 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center typography-label-lg">
            {practiceInitials(name)}
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          className="min-w-0 flex-1"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0]
            if (!file) {
              return
            }
            const reader = new FileReader()
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                onFileSelected(reader.result)
              }
            }
            reader.readAsDataURL(file)
          }}
        />
      </div>
    </label>
  )
}
