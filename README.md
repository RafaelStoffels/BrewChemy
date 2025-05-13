# 🍻 BrewChemy  
*Brewing software for beer lovers*

BrewChemy is an interactive tool designed to support brewers in creating and refining their beer recipes. As users adjust ingredients and quantities, brewing parameters are recalculated in real time, offering immediate feedback on how closely the recipe matches the desired beer style.

## 📸 Demo

Coming soon...

## 🚀 Features

- 🧾Ingredient management with full CRUD operations (malts, hops, yeasts, etc.)
- 🔄 Real-time calculation of key beer parameters (e.g., IBU, ABV, OG)
- 🎯 Style matching and visual feedback based on BJCP guidelines
- 🧪 Dynamic interface for recipe editing
- 🧠 Backend validation and precise parameter calculations using Python
- 🔐 Google OAuth login for easy and secure access  
- 🤖 AI-powered recipe analysis and feedback using ChatGPT

## 🔜 Planned Features

- Calculators

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

## 📁 Project Structure

```bash
project-name/
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