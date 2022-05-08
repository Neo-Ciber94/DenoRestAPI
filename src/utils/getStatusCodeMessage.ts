export default function getStatusCodeMessage(
  statusCode: number
): string | null {
  switch (statusCode) {
    case 400:
      return "Bad Request";
    case 401:
      return "Unauthorized";
    case 403:
      return "Forbidden";
    case 404:
      return "Not Found";
    default:
      return null;
  }
}
