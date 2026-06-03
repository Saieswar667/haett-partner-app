# Haett Partner Portal

Built this as part of a 1-day intern assessment for Haett. It's a full-stack web app where users can apply to become affiliate partners, and admins can review and manage those applications.

---

## What it does

**For users:**
- Sign up / log in
- Submit a partner application (type, business name, social link, etc.)
- See their application status — pending, approved, or rejected
- If rejected, view the reason and reapply with updated details
- If approved, access a dashboard with their discount codes and usage stats

**For admins:**
- Log in to a review panel
- See all applications filtered by status (Pending / Approved / Rejected)
- Approve or reject applications (rejection requires a typed reason)
- Activate or deactivate partner discount codes

---
## Features

* Visitor Landing Page
* User Authentication (Signup/Login)
* Partner Application Form
* Pending Application Status View
* Rejected Application View with Reapply
* Approved Partner Dashboard
* Discount Code Management
* Admin Review Panel
* Approve / Reject Applications
* Discount Code Activation / Deactivation
* Toast Notifications
* SQLite Database Persistence
* JWT Authentication


## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite
- **Auth:** JWT + bcryptjs

I went with SQLite to keep setup dead simple — no database server to configure, just seed and run.

---

## Project Structure

```
haett-partner-app/
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
├── server/
│   ├── server.js
│   ├── db.js
│   ├── seed.js
│   ├── .env
│   └── package.json
└── README.md
```

---

## Running the App

### 1. Clone the repo

```bash
git clone <repository-url>
cd haett-partner-app
```

### 2. Set up the backend

```bash
cd server
npm install
npm run seed
npm run dev
```

Runs on → http://localhost:5000

### 3. Set up the frontend

```bash
cd client
npm install
npm run dev
```

Runs on → http://localhost:5173

---

## Test Credentials

| Role      | Email            | Password     |
|-----------|------------------|--------------|
| Admin     | admin@haett.com  | password123  |
| Test User | user@haett.com   | password123  |

You can also create a new account using the Signup page.

---

## How the flow works

1. User signs up or logs in
2. Fills out the partner application form
3. Application goes into **Pending** state
4. Admin logs in, reviews it, and either **Approves** or **Rejects** it
5. If approved → user gets a partner dashboard with discount codes
6. If rejected → user sees the reason and can reapply

---

## Screenshots

### Landing Page
<img width="1912" height="867" alt="Screenshot 2026-06-02 170250" src="https://github.com/user-attachments/assets/6837a700-ab94-4ae6-b8a4-d64666d67aa3" />

### Signup Page
<img width="1912" height="848" alt="image" src="https://github.com/user-attachments/assets/0de81319-9380-47b8-a7c1-905208b17f7e" />

### Partner Application Form
<img width="1895" height="870" alt="Screenshot 2026-06-02 170813" src="https://github.com/user-attachments/assets/1e8dbdb0-6294-4b9c-a239-750d2e70f236" />

### Pending Status
<img width="1919" height="864" alt="Screenshot 2026-06-02 170827" src="https://github.com/user-attachments/assets/17333b65-dc14-43ef-9779-5729ce59774e" />

### Approved Partner Dashboard
<img width="1891" height="856" alt="image" src="https://github.com/user-attachments/assets/7a6c4707-1576-4756-a837-074d29420477" />

### Rejected Application View
<img width="1916" height="863" alt="image" src="https://github.com/user-attachments/assets/055218c0-10f8-42c6-9426-6894b944ec3d" />



### Admin Review Panel
<img width="1897" height="863" alt="image" src="https://github.com/user-attachments/assets/878a46b3-65db-4f3c-acdb-b2284ddc7cdb" />

---

## Author

**Chaitanya Reddy**  
GitHub: [Saieswar667](https://github.com/Saieswar667)
