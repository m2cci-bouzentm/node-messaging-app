// Regexp from Devshed:
export function validURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
}

export function formatDate(messageSentOnDate: Date | 0): string {
  const messageDate = new Date(messageSentOnDate);
  const today = new Date();
  const isToday = messageDate.toDateString() === today.toDateString();

  return isToday
    ? messageDate.getHours() + ':' + messageDate.getMinutes().toString().padStart(2, '0')
    : messageDate.toDateString();
}
