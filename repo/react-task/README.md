# React Task - Fastor Restaurant App

Simple React (Vite) app that follows the 3 steps from the Postman collection:

1. **Register & get OTP** - `POST /v1/pwa/user/register` (phone, dial_code)
2. **Login with OTP** - `POST /v1/pwa/user/login` (phone, otp, dial_code) -> `response.data.token` (JWT)
3. **Fetch restaurants** - `GET /v1/m/restaurant?city_id=118` with `Authorization: Bearer <token>`

## Run
```bash
npm install
npm run dev      # http://localhost:5173
```
Use any 10-digit number (e.g. 9818979450). Default OTP is `123456`.

## Structure
- `src/api.js` - all API calls
- `src/App.jsx` - phone -> OTP -> login flow (token saved in localStorage)
- `src/Restaurants.jsx` - restaurant list with loading / error / empty states
- `vite.config.js` - dev proxy to `staging.fastor.ai` (avoids CORS)

## Notes
- Layout is a clean responsive UI. Colors/spacing can be matched to the Figma file if needed.
