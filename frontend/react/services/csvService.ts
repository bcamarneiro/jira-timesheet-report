import { buildCsvForUser } from '../utils/csv';

export class CsvService {
  static downloadUserCsv(
    data: any[],
    issueSummaries: Record<string, string>,
    user: string
  ): void {
    const csv = buildCsvForUser(data, issueSummaries, user);
    const filename = `${user.replace(/[^a-z0-9-_]/gi, '_')}.csv`;
    this.downloadFile(filename, csv);
  }

  static downloadMultipleUsers(
    data: any[],
    issueSummaries: Record<string, string>,
    users: string[]
  ): void {
    users.forEach(user => {
      this.downloadUserCsv(data, issueSummaries, user);
    });
  }

  private static downloadFile(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
