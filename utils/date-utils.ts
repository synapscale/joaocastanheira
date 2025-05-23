/**
 * Formats a date string to a localized date format
 * @param dateString The date string to format
 * @returns The formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  } catch (error) {
    return "Data inválida"
  }
}
