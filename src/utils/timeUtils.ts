import type { Day } from '../types/routine';

const TIMEZONE = 'Asia/Dhaka';

/** Get current date/time in Bangladesh Standard Time */
export function getNow(): Date {
  return new Date(
    new Date().toLocaleString('en-US', { timeZone: TIMEZONE })
  );
}

/** Get current day name */
export function getCurrentDay(): Day | null {
  const now = getNow();
  const dayIndex = now.getDay();
  // JS: 0=Sunday, 1=Monday, ... 6=Saturday
  const dayMap: Record<number, Day> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    6: 'Saturday',
  };
  return dayMap[dayIndex] ?? null;
}

/** Parse HH:mm string to minutes since midnight */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Get current time as minutes since midnight (BDT) */
export function getCurrentTimeMinutes(): number {
  const now = getNow();
  return now.getHours() * 60 + now.getMinutes();
}

/** Format minutes since midnight to HH:mm */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/** Format time string to 12-hour format */
export function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/** Format current time as HH:MM:SS AM/PM */
export function formatCurrentTime(date: Date): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
}

/** Format current time in 12-hour format (e.g. "11:02 PM" or "11:02:15 PM") */
export function formatCurrentTime12h(date: Date, showSeconds = false): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  if (showSeconds) {
    return `${displayHours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
  }
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/** Format date as "October 3, 2026" */
export function formatDate(date: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Get the day name from a Date object */
export function getDayName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/** Calculate time difference in human readable format */
export function timeDifference(fromMinutes: number, toMinutes: number): string {
  const diff = toMinutes - fromMinutes;
  if (diff <= 0) return '';
  if (diff < 60) return `${diff}m`;
  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/** Check if a given day is a working day */
export function isWorkingDay(day: string): day is Day {
  return ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'].includes(day);
}
