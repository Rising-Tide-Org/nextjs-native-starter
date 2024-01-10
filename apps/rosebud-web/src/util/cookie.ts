export function parseCookies(cookieString: string) {
  const cookies: { [id: string]: string } = {}

  cookieString.split(';').forEach((pair) => {
    const [name, ...value] = pair.trim().split('=')
    cookies[name] = decodeURIComponent(value.join('='))
  })

  return cookies
}
