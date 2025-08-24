# 🍻 BrewChemy  
*Brewing software for beer lovers*

BrewChemy is an interactive tool designed to support brewers in creating and refining their beer recipes. As users adjust ingredients and quantities, brewing parameters are recalculated in real time, offering immediate feedback on how closely the recipe matches the desired beer style.

## 📸 Demo

Livedemo: https://brewchemy-react.onrender.com/

## 🚀 Features

- 🧾 Ingredient management with full CRUD operations (malts, hops, yeasts, etc.)
- 🔄 Real-time calculation of key beer parameters (e.g., IBU, ABV, OG)
- 🎯 Style matching and visual feedback based on BJCP guidelines
- 🧪 Dynamic interface for recipe editing
- 🧠 Backend validation and precise parameter calculations using Python
- 🔐 Secure authentication using Google OAuth and JWT tokens  
- 🤖 AI-powered recipe analysis and feedback using ChatGPT

## 🔜 Planned Features

- Calculators: Carbonation, ABV/Attenuation
- Add option for users to choose volume unit (liters, gallons, etc.)
- Structured mash process planning
- Add fermentation monitoring tools

## 🛠️ Tech Stack

**Backend:**
- [Python](https://www.python.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [SQLAlchemy](https://www.sqlalchemy.org/)
- [Ruff](https://docs.astral.sh/ruff/) – for linting
- [Black](https://black.readthedocs.io/en/stable/) – for automatic code formatting

**Frontend:**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/) – fast frontend build and development tool
- [Axios](https://axios-http.com/) – for communication between frontend and backend
- [React Hook Form](https://react-hook-form.com/) – for form handling and validation
- [Yup](https://github.com/jquense/yup) – for schema-based form validation
- [ESLint](https://eslint.org/) – for linting and code style enforcement

## 🚀 Installation (1 command)

Make sure you have **Docker** and **Docker Compose** installed.

Then, just run:

```bash
git clone https://github.com/RafaelStoffels/BrewChemy.git
cd Brewchemy
docker-compose up --build
```

## ⚙️ Environment variables

### Backend

```bash
| Variable                     | Description                              | Required | Default                                  |
|------------------------------|------------------------------------------|----------|------------------------------------------|
| `BACKEND_URL`                | Base URL for backend                     | Yes      | `https://localhost:10000`                |
| `FRONTEND_URL`               | Base URL for frontend                    | Yes      | `https://localhost:5173`                 |
| `DB_USER`                    | Database´s user                          | Yes      | `postgres`                               |
| `DB_PASSWORD`                | Database´s password                      | Yes      | `brewchemy`                              |
| `DB_HOST`                    | Database´s host                          | Yes      | `localhost`                              |
| `DB_PORT`                    | Database´s port number                   | Yes      | `5433`                                   |
| `DB_NAME`                    | Database´s name                          | Yes      | `brewchemy`                              |
| `DATABASE_URL`               | Database URL                             | Yes      | `postgresql+psycopg2://postgres:brewchemy@localhost:5433/brewchemy`
| `JWT_SECRET`                 |                                          | No       |                                          |
| `JWT_ALG`                    |                                          | No       |                                          |
| `CORS_ORIGINS`               |                                          | No       |                                          |
| `GOOGLE_CLIENT_ID`           | Required if Google login is enabled      | No       | `your_client_id`                         |
| `GOOGLE_CLIENT_SECRET`       | Required if Google login is enabled      | No       | `your_client_secret`                     |
| `GOOGLE_REDIRECT_URI`        | Required if Google login is enabled      | No       | `GOOGLE_REDIRECT_URI`                    |
| `GOOGLE_AUTH_URL`            | Required if Google login is enabled      | No       | `GOOGLE_AUTH_URL`                        |
| `GOOGLE_TOKEN_URL`           | Required if Google login is enabled      | No       | `GOOGLE_TOKEN_URL`                       |
| `MAIL_USERNAME`              | You can log in using your Google account | No       | `your_username`                          |
| `MAIL_PASSWORD`              | You can log in using your Google account | No       | `your_password`                          |
| `MAIL_SERVER`                | You can log in using your Google account | No       | `your_mail_server`                       |
| `MAIL_PORT`                  | You can log in using your Google account | No       | `your_mail_port`                         |
| `MAIL_DEFAULT_SENDER`        | You can log in using your Google account | No       | `your_username`                          |
| `MAIL_USE_TLS       `        | You can log in using your Google account | No       | `true`                                   |
| `OPENAI_API_KEY`             | openAI key to activate AI                | No       | `openAI_key`                             |
```

### Frontend

```bash
| Variable                     | Description                     | Required | Default                                   |
|------------------------------|---------------------------------|----------|-------------------------------------------|
| `VITE_API_URL`               | Base URL for frontend API       | Yes      | `http://localhost:10000`                  |
| `VITE_GOOGLE_LOGIN_URL`      | Variable for google login       | Yes      | `https://localhost:10000/api/google-login`|
```

## 📁 Project Structure

```bash
BrewChemy/
├── backend/
│   ├── migrations/
│   └── app/
│       ├── main.py
│       ├── routers/
│       ├── schemas/
│       ├── scripts/
│       └── utils/
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── Pages/
│   │   ├── services/
│   │   ├── Styles/
│   │   ├── utils/
│   └── public/
└── README.md
```

## 📂 Important Files & Scripts

- **entrypoint.sh**  
  Used only for local development with Docker.  
  - Waits for the database to be ready  
  - Applies migrations (`alembic upgrade head`)  
  - Runs the seed script (`python -m app.scripts.seed`)  
  - Starts the FastAPI server with Gunicorn  

- **app/scripts/seed.py**  
  Seeds the database with an initial admin user (idempotent, won’t duplicate).

- **alembic.ini** & **migrations/**  
  Alembic configuration and migration history.  
  Used to keep the database schema in sync with the models.  

- **app/config.py**  
  Centralized application settings using Pydantic.  
  All environment variables are loaded here.  

## 🤝 Contributing

- Fork this repository
- Create a new branch
git checkout -b feature/your-feature
- Make your changes and commit
git commit -m "Add your feature"
- Push your branch
git push origin feature/your-feature
- Open a Pull Request on GitHub

## 🔧 Code Style

### Backend

This project follows [PEP 8](https://peps.python.org/pep-0008/) with the following adjustments:

- Line length limit increased to **100 characters**.

Recommended tools:

- `black` (optional, using default settings)

### Frontend

This project follows the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) using ESLint to enforce consistent code quality and best practices.

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to use, modify, and share this project for **non-commercial purposes only**, provided that proper attribution is given to the original author.
