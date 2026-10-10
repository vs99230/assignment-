# Full Stack Developer Assignment - Vaibhav Singh

This repo has both assignment tasks in separate folders.

| Folder | Task | Stack |
|---|---|---|
| [`react-task`](./react-task) | Login with OTP + restaurant list (Fastor API) | React, Vite |
| [`node-task`](./node-task) | CRM REST API: employee auth, public enquiry form, claim leads | Node.js, Express, PostgreSQL, JWT |

Each folder has its own README with setup steps and examples.

## Quick start

**React task**
```bash
cd react-task && npm install && npm run dev
```

**Node task**
```bash
cd node-task && npm install
cp .env.example .env     # set DATABASE_URL and JWT_SECRET
npm run db:init && npm start
```
