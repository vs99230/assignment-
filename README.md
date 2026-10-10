# Full Stack Developer Assignment

**Submitted by:** Vaibhav Singh  
**GitHub:** [vs99230](https://github.com/vs99230)

This repository contains both assignment tasks, each in its own folder with its own setup steps.

| Folder | Task | Tech Stack |
|---|---|---|
| [`react-task`](./react-task) | OTP login and restaurant listing (Fastor API) | React, Vite |
| [`node-task`](./node-task) | CRM REST API: employee auth, public enquiry form, claim leads | Node.js, Express, PostgreSQL, JWT |

---

## Repository Structure

```
.
├── README.md
├── react-task/
│   ├── src/
│   │   ├── api.js            # All API calls
│   │   ├── App.jsx           # Phone -> OTP -> Login flow
│   │   ├── Restaurants.jsx   # Restaurant list
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── vite.config.js        # Dev proxy to staging.fastor.ai
│   └── package.json
└── node-task/
    ├── src/
    │   ├── routes/           # auth.js, enquiries.js
    │   ├── middleware/       # auth.js (JWT), errors.js
    │   ├── app.js
    │   ├── server.js
    │   ├── db.js
    │   ├── initDb.js
    │   └── validators.js
    ├── schema.sql
    ├── .env.example
    └── package.json
```

---

## Task 1: React Developer (`react-task`)

A React app that follows the three steps in the provided Postman collection.

### Flow

1. **Register and get OTP**: `POST /v1/pwa/user/register` with `phone`, `dial_code`
2. **Login with OTP**: `POST /v1/pwa/user/login` with `phone`, `otp`, `dial_code`. The JWT is read from `response.data.token`.
3. **Fetch restaurants**: `GET /v1/m/restaurant?city_id=118` with header `Authorization: Bearer <token>`

### Features

- Phone number entry with validation (10 digits)
- OTP step (default OTP is `123456`)
- Token stored in `localStorage`, so the session survives a refresh
- Restaurant list with loading, error and empty states
- Logout
- Responsive layout

### Run

```bash
cd react-task
npm install
npm run dev
```

Open http://localhost:5173 and log in with any 10-digit number (for example `9818979450`) and OTP `123456`.

> In development, requests go through a Vite proxy (`/api` -> `https://staging.fastor.ai`) to avoid CORS issues. To call the server directly, create `.env` with `VITE_API_BASE=https://staging.fastor.ai`.

---

## Task 2: Node.js Developer (`node-task`)

A REST API for a simple CRM system.

### Business Logic

- Every employee/counselor has an account (identified by email).
- A public enquiry form lets prospective clients submit their details (name, email, course interest). No authentication is needed.
- All logged-in employees can see unclaimed (public) enquiries.
- An employee can **claim** an enquiry. After that it becomes private to that employee and disappears from the public list.

### API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Yes | Register an employee |
| POST | `/api/auth/login` | Yes| Login, returns JWT |
| POST | `/api/enquiries` | Yes| Submit the public enquiry form |
| GET | `/api/enquiries/unclaimed` | Bearer | List all unclaimed enquiries |
| POST | `/api/enquiries/:id/claim` | Bearer | Claim an enquiry |
| GET | `/api/enquiries/mine` | Bearer | List enquiries claimed by the logged-in employee |
| GET | `/health` | No | Health check |

Send the token as `Authorization: Bearer <token>`.

### Database

PostgreSQL with two tables (see `node-task/schema.sql`):

- `employees`: id, name, email (unique), password_hash, created_at
- `enquiries`: id, name, email, phone, course_interest, message, claimed_by (FK to employees), claimed_at, created_at

### Run

```bash
cd node-task
npm install
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
npm run db:init           # creates tables
npm start                 # http://localhost:3000
```

### Example Requests

```bash
# 1. Register an employee
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Asha","email":"asha@company.com","password":"secret123"}'

# 2. Submit a public enquiry (no token)
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi","email":"ravi@mail.com","course_interest":"Data Science"}'

# 3. See unclaimed enquiries
curl http://localhost:3000/api/enquiries/unclaimed -H "Authorization: Bearer $TOKEN"

# 4. Claim enquiry with id 1
curl -X POST http://localhost:3000/api/enquiries/1/claim -H "Authorization: Bearer $TOKEN"

# 5. See my claimed enquiries
curl http://localhost:3000/api/enquiries/mine -H "Authorization: Bearer $TOKEN"
```

### Design Decisions

- **Safe claiming:** claiming is one atomic SQL update (`WHERE claimed_by IS NULL`). If two employees claim at the same time, only one succeeds and the other gets `409 Already claimed`.
- **Security:** passwords are hashed with bcrypt, all queries are parameterized, input is validated, and `helmet` plus CORS are enabled.
- **Clear responses:** consistent JSON format (`success`, `message`, `data`) with proper status codes (400, 401, 404, 409).

---

## Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt
