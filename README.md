# Frequent Flyer Portal

An accessible and responsive web application for managing frequent flyer records digitally. Staff can add, view, search, edit, and delete member records through a simple dashboard.

## Features

- **Member Management:** Add, view, edit, and delete frequent flyer records.
- **Search:** Find member records quickly.
- **Form Validation:** Validate required fields, email addresses, and numeric values.
- **Input Sanitization:** Sanitize user input to help prevent XSS attacks.
- **Loading and Empty States:** Display loading indicators and helpful messages when no records are available.
- **Accessibility:** Semantic HTML, accessible labels, and keyboard-friendly interactions.
- **Responsive Design:** Clean, monochromatic interface for different screen sizes.
- **Data Persistence:** Store records in browser local storage.
- **Telemetry:** Log primary user interactions in the browser console.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES Modules)
- Vite
- Vitest
- jsdom
- DOMPurify
- Testing Library DOM

## Getting Started

### Prerequisites

Install [Node.js](https://nodejs.org/) and npm.

### Installation

Clone the repository:

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Navigate to the project directory:

```bash
cd frequent-flyer-portal
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

## Testing

Run the test suite:

```bash
npm test
```

Run unit tests, if supported by the project:

```bash
npm run test:unit
```

Create a production build:

```bash
npm run build
```

## Live Demo

[Open Frequent Flyer Portal](https://frequent-flyer-portal-kr5vngy4e-vision-demo1.vercel.app/)

## Project Structure

```text
frequent-flyer-portal/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── PROMPTS.md
├── src/
│   ├── app.js
│   ├── main.js
│   ├── services/
│   ├── styles/
│   └── utils/
└── tests/
    ├── integration/
    ├── unit/
    └── setup.js
```

## Data and Privacy

The application stores records in browser local storage. It does not use a shared backend database. Avoid entering real or sensitive personal information.
