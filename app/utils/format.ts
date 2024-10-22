const dateFormat = new Intl.DateTimeFormat('de-DE', {
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	timeZone: 'Europe/Vienna',
});

const dateFormatLong = new Intl.DateTimeFormat('de-DE', {
	day: 'numeric',
	month: 'numeric',
	year: 'numeric',
	timeZone: 'Europe/Vienna',
});

const dateTimeFormat = new Intl.DateTimeFormat('de-DE', {
	day: 'numeric',
	month: 'numeric',
	year: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
});

export function formatDate(date: Date) {
	return dateFormat.format(date);
}

export function formatDateLong(date: Date) {
	return dateFormatLong.format(date);
}

export function formatDateTime(date: Date) {
	return dateTimeFormat.format(date);
}
