import { format, isValid, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 安全に日付をフォーマットする関数
 * null/undefined/無効な日付の場合は "-" を返す
 */
export function formatDate(
  dateValue: string | Date | null | undefined,
  formatStr: string = "yyyy/MM/dd"
): string {
  if (!dateValue) return "-";
  try {
    const date = typeof dateValue === "string" ? parseISO(dateValue) : dateValue;
    if (!isValid(date)) return "-";
    return format(date, formatStr, { locale: ja });
  } catch {
    return "-";
  }
}

/**
 * 日付が有効かどうかをチェック
 */
export function isValidDate(dateValue: string | Date | null | undefined): boolean {
  if (!dateValue) return false;
  try {
    const date = typeof dateValue === "string" ? parseISO(dateValue) : dateValue;
    return isValid(date);
  } catch {
    return false;
  }
}
