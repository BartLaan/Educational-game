const minutesToMs = (minutes: number) => 1000 * 60 * 60 * minutes

export function setCookie(cookieName: string, cookieValue: string, minutesValid?: number): boolean {
	let cookie = `${cookieName}=${cookieValue};`

	if (minutesValid) {
		const date = new Date()
		date.setTime(date.getTime() + minutesToMs(minutesValid))
		cookie += `expires=${date.toUTCString()}; path=/; secure`
	}

	window.document.cookie = cookie
	return true
}

export function getCookie(cookieName: string): string | undefined {
	const cookieList = decodeURIComponent(window.document.cookie).split('; ')
	const cookie: string | undefined = cookieList.filter((ck) => ck.split('=')[0] === cookieName)[0]
	const cookieValue = (cookie || '').split('=')[1]

	return cookieValue !== '' ? cookieValue : undefined
}

export const deleteCookie = (cookieName: string): boolean => setCookie(cookieName, '', -1)
