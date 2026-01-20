export function getRequestOrigin(event: H3Event) {
  const proto =
    getHeader(event, 'x-forwarded-proto') ??
    'http'

  const host =
    getHeader(event, 'x-forwarded-host') ??
    getHeader(event, 'host')

  return `${proto}://${host}`
}
