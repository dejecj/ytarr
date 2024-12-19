import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDiskSize = (bytes: number): string => {
  if (bytes === 0) return "0 bytes";

  const units = ["bytes", "KB", "MB", "GB", "TB"];
  const factor = 1024;
  const index = Math.floor(Math.log(bytes) / Math.log(factor));

  const value = bytes / Math.pow(factor, index);

  return `${parseFloat(value.toFixed(2))} ${units[index]}`;
}

export const formatNumber = (num: number) => {
  if (num === 0) return "0";

  const units = [
    { value: 1_000_000_000_000, suffix: "T" },
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" }
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formattedNum = (num / unit.value).toFixed(1).replace(/\.0$/, '');
      return `${formattedNum}${unit.suffix}`;
    }
  }

  return num.toString();
}

export const removeSpecialCharacters = (input: string) => {
  return input
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '_');
}