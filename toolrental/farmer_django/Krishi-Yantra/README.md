# Krishi-Yantra: Agricultural Tool Rental Platform

Krishi-Yantra is a full-stack web application designed to empower farmers and agricultural workers by providing a centralized platform to rent and lease farming equipment. Tool owners can list their unused machinery to earn passive income, while renters can easily find and book the equipment they need for specific durations.

---

## 🚀 How It Works

The platform operates on a bipartite marketplace model connecting **Owners** and **Renters**.

1. **User Registration & Profiles**: Users sign up equipped with their contact details (Name, Phone, Address, Location). This allows seamless communication between parties.
2. **Browsing & Discovery**: Any user can land on the homepage and browse the catalogue of agricultural tools (e.g., tractors, harvesters, pumps).
3. **Availability Engine**: When a user clicks on a tool, they select a start and end date for their rental. The system automatically calculates whether there are enough units in stock for those specific overlapping dates.
4. **Booking Requests**: A renter submits a booking request. The system calculates the estimated total based on the required duration (`price_per_day * duration * units`). The booking sits in a `PENDING` state and the owner is notified. (Note: Owners are restricted from booking their own tools).
5. **Owner Dashboard**: Tool owners receive the booking requests in their dashboard. They can review the renter's contact details and either **Approve** or **Reject** the request based on their own logistics.
6. **Confirmation**: Once approved, the booking is `CONFIRMED`, and the units are officially blocked out from the inventory for that date range.

---

## ⚙️ How the API Works

The backend exposes a **RESTful API** using Django REST Framework structured around resource-based routing. The data flows primarily in JSON format. 

### Authentication Flow (SimpleJWT)
- The API is secured using **JSON Web Tokens (JWT)**.
- When an application first logs in via `POST /api/users/token/`, the server independently verifies the credentials and responds with two tokens: an **Access Token** and a **Refresh Token**.
- For all subsequent private requests (like booking a tool or viewing a dashboard), the frontend attaches the Access Token in the `Authorization: Bearer <token>` HTTP header.
- The backend `IsAuthenticated` permission class decodes this token cryptographically to identify the user without requiring repeated database session lookups.

### Core Endpoints and Workflows
- **`GET /api/tools/` & `GET /api/tools/<id>/`:** Public endpoints fetched by the frontend to render the catalogue. The detail endpoint also validates `?start=YYYY-MM-DD&end=YYYY-MM-DD` queries to return real-time availability via our custom backend date overlap logic.
- **`POST /api/tools/create/`:** Handled by `multipart/form-data` to support image uploads alongside standard text fields, creating a new tool strictly bound to the authorized user.
- **`POST /api/bookings/create/`:** A secured endpoint that cross-validates dates, compares against existing active bookings to prevent double-booking, and persists the reservation.
- **`PUT /api/bookings/<id>/approve/`:** Enables the owner of the tool (validated via the token) to transition the booking state from `PENDING` to `CONFIRMED`.

---

## 🛠️ Technology Stack: What & Why

### Frontend
- **React.js**: The core UI library. *Why?* It allows us to build a dynamic, single-page application (SPA) that updates intuitively without full page reloads, providing a smooth app-like experience for users.
- **Redux & Redux Thunk**: Global state management. *Why?* As the app scales (managing user sessions, fetching tools, tracking booking lists), Redux maintains a single source of truth. Thunk allows us to dispatch asynchronous actions (like hitting our API) neatly and cleanly.
- **React-Bootstrap & Vanilla CSS**: UI component framework. *Why?* Bootstrap provides battle-tested, responsive grids, forms, and modals right out of the box, drastically speeding up development while ensuring the app works perfectly on mobile devices (crucial for farmers accessing it from the field).
- **Axios**: HTTP client. *Why?* It seamlessly intercepts requests to inject our JWT authentication tokens automatically, saving us from writing repetitive fetch headers and dealing with complex token refresh flows manually.

### Backend
- **Django**: The core web framework (Python). *Why?* Django’s "batteries-included" approach gives us a robust ORM (Object-Relational Mapper), automatic database migrations, an admin panel, and high security (against SQL injection, CSRF) right out of the box.
- **Django REST Framework (DRF)**: API toolkit. *Why?* DRF drastically simplifies serializing complex database models into JSON, provides standardized request parsing, and offers powerful class-based permission rules out of the box to protect our endpoints.
- **djangorestframework-simplejwt**: Authentication library. *Why?* JWTs are stateless. By using JWTs over traditional session cookies, our backend server consumes less memory, and the frontend can operate perfectly cross-domain (CORS compliant).
- **SQLite**: Database. *Why?* Included natively with Python, it is the perfect zero-configuration database for rapid development and moderate application workloads.

---

## 💻 Local Setup & Installation

**Prerequisites:** Python 3.10+ and Node.js 18+

### 1. Backend (Django)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
*The backend API will run on `http://127.0.0.1:8000`*

### 2. Frontend (React)
Open a new terminal configuration:
```bash
cd frontend
npm install
npm start
```
*The web app will run on `http://localhost:3000`*
