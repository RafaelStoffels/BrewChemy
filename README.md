# 🍻 BrewChemy  
*Brewing software for beer lovers*

BrewChemy is an interactive tool designed to support brewers in creating and refining their beer recipes. As users adjust ingredients and quantities, brewing parameters are recalculated in real time, offering immediate feedback on how closely the recipe matches the desired beer style.

## 📸 Demo

Livedemo: https://brewchemy-react.onrender.com/

## 🚀 Features

- 🧾Ingredient management with full CRUD operations (malts, hops, yeasts, etc.)
- 🔄 Real-time calculation of key beer parameters (e.g., IBU, ABV, OG)
- 🎯 Style matching and visual feedback based on BJCP guidelines
- 🧪 Dynamic interface for recipe editing
- 🧠 Backend validation and precise parameter calculations using Python
- 🔐 Secure authentication using Google OAuth and JWT tokens  
- 🤖 AI-powered recipe analysis and feedback using ChatGPT

## 🔜 Planned Features

- Calculators: Carbonation, ABV/Attenuation
- Add option for users to choose volume unit (liters, gallons, etc.)
- Add option for users to choose weight unit (kilograms, pounds, etc.)
- Structured mash process planning
- Add fermentation monitoring tools

## 🛠️ Tech Stack

**Backend:**
- [Python](https://www.python.org/)
- [Flask](https://flask.palletsprojects.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [SQLAlchemy](https://www.sqlalchemy.org/)

**Frontend:**
- [React](https://reactjs.org/)
- [Axios](https://axios-http.com/) – for communication between frontend and backend

## 📦 Installation

### 🔗 Clone the Repository

git clone https://github.com/RafaelStoffels/BrewChemy.git

### 🧰 Backend Setup (Flask)

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend:

```bash
cd ../frontend
npm install
npm start
```

## ⚙️ Environment variables

### Backend

```bash
| Variable                     | Description                              | Required | Default                                  |
|------------------------------|------------------------------------------|----------|------------------------------------------|
| `MAIL_USERNAME`              | You can log in using your Google account | No       | `your_username`                          |
| `MAIL_PASSWORD`              | You can log in using your Google account | No       | `your_password`                          |
| `MAIL_SERVER`                | You can log in using your Google account | No       | `your_mail_server`                       |
| `MAIL_PORT`                  | You can log in using your Google account | No       | `your_mail_port`                         |
| `GOOGLE_CLIENT_ID`           | Required if Google login is enabled      | No       | `your_client_id`                         |
| `GOOGLE_CLIENT_SECRET`       | Required if Google login is enabled      | No       | `your_client_secret`                     |
| `ENVIRONMENT`                | Local or Production                      | Yes      | `local`                                  |
| `BACKEND_URL`                | Base URL for backend                     | Yes      | `https://localhost:5000`                 |
| `FRONTEND_URL`               | Base URL for frontend                    | Yes      | `https://localhost:3000`                 |
| `DB_USER`                    | Database´s user                          | Yes      | `postgres_user`                          |
| `DB_PASSWORD`                | Database´s password                      | Yes      | `postgres_password`                      |
| `DB_HOST`                    | Database´s host                          | Yes      | `localhost`                              |
| `DB_PORT`                    | Database´s port number                   | Yes      | `db_port_number`                         |
| `DB_NAME`                    | Database´s name                          | Yes      | `brewchemy`                              |
```

### Frontend

```bash
| Variable                     | Description                     | Required | Default                                  |
|------------------------------|---------------------------------|----------|------------------------------------------|
| `REACT_APP_API_URL`          | Base URL for frontend API       | Yes      | `http://localhost:5000`                  |
| `REACT_APP_GOOGLE_LOGIN_URL` | Variable for google login       | Yes      | `https://localhost:5000/api/google-login`|
```

## 📁 Project Structure

```bash
BrewChemy/
├── backend/
│   ├── app.py
│   └── routes/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   └── public/
└── README.md
```

## 🤝 Contributing

- Fork this repository
- Create a new branch
git checkout -b feature/your-feature
- Make your changes and commit
git commit -m "Add your feature"
- Push your branch
git push origin feature/your-feature
- Open a Pull Request on GitHub

## Code Style

This project follows [PEP 8](https://peps.python.org/pep-0008/) with the following adjustments:

- Line length limit increased to **100 characters**.

Recommended tools:

- `flake8` with `max-line-length = 100`
- `black` (optional, using default settings)

Example configuration for `.flake8`:

```ini
[flake8]
max-line-length = 90