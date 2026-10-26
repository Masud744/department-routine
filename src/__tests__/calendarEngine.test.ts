import { describe, it, expect } from 'vitest';
import {
  normalizeDate,
  daysBetween,
  getHolidayForDate,
  isHoliday,
  getNextUpcomingHoliday,
  getUpcomingHolidays,
  getCurrentPhaseForBatch,
  isExamRunning,
  getSemesterProgress,
  getUpcomingDeadlines,
} from '../utils/calendarEngine';
import { ACADEMIC_HOLIDAYS_2026_2027 } from '../data/calendar';

describe('calendarEngine', () => {
  describe('normalizeDate and daysBetween', () => {
    it('normalizes string dates correctly', () => {
      expect(normalizeDate('2026-10-26T15:30:00Z')).toBe('2026-10-26');
      expect(normalizeDate('2026-10-26')).toBe('2026-10-26');
    });

    it('calculates days between two dates correctly', () => {
      expect(daysBetween('2026-10-20', '2026-10-25')).toBe(5);
      expect(daysBetween('2026-10-25', '2026-10-20')).toBe(-5);
      expect(daysBetween('2026-10-26', '2026-10-26')).toBe(0);
    });
  });

  describe('Holiday Detection', () => {
    it('identifies single day holidays', () => {
      // 05 Aug 2026: July Mass Uprising Day
      const holiday = getHolidayForDate('2026-08-05');
      expect(holiday).not.toBeNull();
      expect(holiday?.name).toBe('July Mass Uprising Day');
      expect(isHoliday('2026-08-05')).toBe(true);

      // Laxmi Puja
      expect(getHolidayForDate('2026-10-25')?.name).toBe('Laxmi Puja');
      // Victory Day
      expect(getHolidayForDate('2026-12-16')?.name).toBe('Victory Day');
    });

    it('identifies multi-day holidays across entire date range', () => {
      // Durga Puja: 2026-10-17 to 2026-10-21
      expect(isHoliday('2026-10-16')).toBe(false);
      expect(isHoliday('2026-10-17')).toBe(true);
      expect(isHoliday('2026-10-19')).toBe(true);
      expect(isHoliday('2026-10-21')).toBe(true);
      expect(isHoliday('2026-10-22')).toBe(false);

      const dp = getHolidayForDate('2026-10-19');
      expect(dp?.name).toBe('Durga Puja');
      expect(dp?.days).toBe(5);

      // Winter Vacation: 2026-12-19 to 2026-12-23
      expect(isHoliday('2026-12-19')).toBe(true);
      expect(isHoliday('2026-12-23')).toBe(true);
      expect(isHoliday('2026-12-24')).toBe(false);
    });

    it('returns null on a regular academic day', () => {
      expect(getHolidayForDate('2026-10-26')).toBeNull();
      expect(isHoliday('2026-10-26')).toBe(false);
    });

    it('finds the next upcoming holiday correctly', () => {
      // From 2026-10-26, next holiday is Shyama Puja on 2026-11-08
      const next = getNextUpcomingHoliday('2026-10-26');
      expect(next).not.toBeNull();
      expect(next?.holiday.name).toBe('Shyama Puja');
      expect(next?.daysUntil).toBe(13); // 2026-11-08 - 2026-10-26 = 13 days
    });

    it('returns list of upcoming holidays with limit', () => {
      const upcoming = getUpcomingHolidays('2026-10-26', 3);
      expect(upcoming.length).toBe(3);
      expect(upcoming[0].name).toBe('Shyama Puja');
      expect(upcoming[1].name).toBe('Martyred Intellectuals Day');
      expect(upcoming[2].name).toBe('Victory Day');
    });
  });

  describe('Semester Phases by Batch', () => {
    it('accurately identifies 8th Batch phases', () => {
      // 8th Batch Service Week: 2026-07-18
      const p1 = getCurrentPhaseForBatch('2025-26', '2026-07-18');
      expect(p1?.type).toBe('service_week');

      // 8th Batch Pre-Mid Classes: 2026-08-10
      const p2 = getCurrentPhaseForBatch('2025-26', '2026-08-10');
      expect(p2?.type).toBe('classes');

      // 8th Batch Midterm Exam: 2026-09-22
      const p3 = getCurrentPhaseForBatch('2025-26', '2026-09-22');
      expect(p3?.type).toBe('midterm_exam');

      // 8th Batch Post-Mid Classes: 2026-10-26
      const p4 = getCurrentPhaseForBatch('2025-26', '2026-10-26');
      expect(p4?.type).toBe('classes');

      // 8th Batch Final Exam: 2026-12-05
      const p5 = getCurrentPhaseForBatch('2025-26', '2026-12-05');
      expect(p5?.type).toBe('final_exam');
    });

    it('distinguishes different phases between batches on the same date', () => {
      // Date: 2026-09-25
      // 8th Batch (2025-26): Midterm Examination (19 Sep - 04 Oct)
      const batch8Exam = isExamRunning('2025-26', '2026-09-25');
      expect(batch8Exam.isExam).toBe(true);
      expect(batch8Exam.examType).toBe('midterm');

      // 4th Batch (2021-22): Not started yet on Sep 25 (starts 3 Oct)
      const batch4Exam = isExamRunning('2021-22', '2026-09-25');
      expect(batch4Exam.isExam).toBe(false);

      // Date: 2026-12-02
      // 4th Batch: Midterm Examination (28 Nov - 15 Dec)
      expect(isExamRunning('2021-22', '2026-12-02').examType).toBe('midterm');

      // 8th Batch: Final Examination (28 Nov - 15 Dec)
      expect(isExamRunning('2025-26', '2026-12-02').examType).toBe('final');
    });
  });

  describe('Semester Progress Calculation', () => {
    it('computes percentage and week numbers', () => {
      // 8th Batch: 2026-07-15 to 2026-12-15 (153 days)
      const progressMid = getSemesterProgress('2025-26', '2026-10-26');
      expect(progressMid).not.toBeNull();
      expect(progressMid?.percent).toBeGreaterThan(60);
      expect(progressMid?.percent).toBeLessThan(75);
      expect(progressMid?.currentWeek).toBeGreaterThan(13);
      expect(progressMid?.isCompleted).toBe(false);
      expect(progressMid?.notStarted).toBe(false);

      // Before start
      const progressBefore = getSemesterProgress('2025-26', '2026-01-01');
      expect(progressBefore?.notStarted).toBe(true);
      expect(progressBefore?.percent).toBe(0);

      // After end
      const progressAfter = getSemesterProgress('2025-26', '2027-01-01');
      expect(progressAfter?.isCompleted).toBe(true);
      expect(progressAfter?.percent).toBe(100);
    });
  });

  describe('Deadlines and Alerts', () => {
    it('retrieves upcoming deadlines for a batch', () => {
      const deadlines = getUpcomingDeadlines('2025-26', '2026-10-26', 3);
      expect(deadlines.length).toBeGreaterThan(0);
      // Next for 8th batch after Oct 26 is Midterm Result Publication on 2026-10-31
      expect(deadlines[0].deadline.title).toBe('Midterm Result Publication');
      expect(deadlines[0].daysUntil).toBe(5);
    });

    it('contains all 18 official holidays in the dataset', () => {
      expect(ACADEMIC_HOLIDAYS_2026_2027.length).toBe(18);
    });
  });
});
