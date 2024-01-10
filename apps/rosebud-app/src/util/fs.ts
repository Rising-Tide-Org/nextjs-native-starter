export const downloadFile = (
  fileName: string,
  content: string,
  type = 'text/md'
) => {
  const link = document.createElement('a')
  const blob = new Blob([content], { type })

  link.setAttribute('href', URL.createObjectURL(blob))
  link.setAttribute('download', fileName)
  link.click()
  link.remove()

  URL.revokeObjectURL(link.href)
}
