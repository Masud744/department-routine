# Department Routine & Live Room Allocation System

> **[Department of Internet of Things and Robotics Engineering (IRE)](https://ire.uftb.ac.bd/)**  
> University of Frontier Technology, Bangladesh (UFTB)

A modern, production-grade academic routine and real-time room occupancy management web application designed for students, faculty, and administrative staff.

---

## 🚀 Features

### 1. Live Room Allocation Dashboard
- **Real-Time Occupancy Board**: Instantly view whether classrooms and laboratories (`1002`, `2002`, `4002`, `5002`, `LAB-4701`, `LAB-5701`, `IOT-LAB`) are currently **Occupied**, **Available**, or **Upcoming**.
- **Live Clock Synchronization**: Automatically recalculates room availability, remaining class duration, and time until the next lecture.
- **Running Now & Next Classes**: Fast-access view of ongoing and upcoming academic sessions.

### 2. Batch Routine Schedules
Supports all departmental batches with dedicated timetable and list views:
- **4th Batch** (Session 2021–22)
- **5th Batch** (Session 2022–23)
- **6th Batch** (Session 2023–24)
- **7th Batch** (Session 2024–25)
- **8th Batch** (Session 2025–26)

### 3. Faculty Directory
Comprehensive directory of faculty members with full names, short codes, and weekly schedules:
- **Md. Ashiqussalehin** (`MAS`)
- **Fahmida Ahmed Antara** (`FAA`)
- **Sadia Enam** (`SE`)
- **Md. Toukir Ahmed** (`MTA`)
- **Saurav Chandra Das** (`SCD`)
- **Mostafiz Ahammed** (`MAH`)
- **Mahir Mahbub** (`MM`)
- **Md. Rafiqul Islam** (`MRI`)
- **Suman Saha** (`SS`)
- **Farzana Akter** (`FA`)

### 4. Global Search
Search across courses, rooms, faculty members (by short code or full name), and batches (e.g. `4th batch`, `2023-24`, `IRE 103`, `5002`, `Ashiqussalehin`).

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite 8](https://vite.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with JSDOM
- **Code Quality**: [Oxlint](https://oxc.rs/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Masud744/department-routine.git
cd department-routine

# Install dependencies
npm install
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Running Tests
```bash
npm test
# or
npx vitest run
```

### Production Build
```bash
npm run build
```

---

## 🏫 Official Links
- **Department Website**: [https://ire.uftb.ac.bd/](https://ire.uftb.ac.bd/)
- **Repository**: [https://github.com/Masud744/department-routine.git](https://github.com/Masud744/department-routine.git)
