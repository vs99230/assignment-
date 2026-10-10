# CRM Backend (Node.js + Express + PostgreSQL + JWT)

## Setup
```bash
npm install
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
createdb crm              # or create the DB any way you like
npm run db:init           # creates tables from schema.sql
npm start                 # http://localhost:3000
```

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register | No | Employee register (name, email, password) |
| POST | /api/auth/login | No | Employee login, returns JWT |
| POST | /api/enquiries | **No** | Public enquiry form (name, email, phone?, course_interest, message?) |
| GET | /api/enquiries/unclaimed | Bearer | All public (unclaimed) enquiries |
| POST | /api/enquiries/:id/claim | Bearer | Claim an enquiry (becomes private) |
| GET | /api/enquiries/mine | Bearer | Enquiries claimed by logged-in employee |

Send the token as `Authorization: Bearer <token>`.

## Example
```bash
curl -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Asha","email":"asha@co.com","password":"secret123"}'

curl -X POST localhost:3000/api/enquiries -H 'Content-Type: application/json' \
  -d '{"name":"Ravi","email":"ravi@mail.com","course_interest":"Data Science"}'

curl localhost:3000/api/enquiries/unclaimed -H "Authorization: Bearer $TOKEN"
curl -X POST localhost:3000/api/enquiries/1/claim -H "Authorization: Bearer $TOKEN"
curl localhost:3000/api/enquiries/mine -H "Authorization: Bearer $TOKEN"
```

## Design notes
- Claiming uses a single atomic `UPDATE ... WHERE claimed_by IS NULL`, so two counselors can never claim the same lead (second gets `409`).
- Claimed enquiries disappear from `/unclaimed`, so they are private to the claiming employee.
- Passwords hashed with bcrypt; all queries parameterized; input validated.
