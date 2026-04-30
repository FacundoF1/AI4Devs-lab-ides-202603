# LTI - Talent Tracking System  | EN

This project is a full-stack application with a React frontend and an Express backend using Firebase Admin SDK (Firestore) as the database. The frontend is initiated with Create React App, and the backend is written in TypeScript.

## Directory and File Explanation

- `backend/`: Contains the server-side code written in Node.js.
  - `src/`: Contains the source code for the backend.
    - `index.ts`: The entry point for the backend server.
  - `tsconfig.json`: TypeScript configuration file.
  - `.env`: Contains Firebase service-account environment variables.
  - `.env.example`: Template with documented placeholder values.
- `frontend/`: Contains the client-side code written in React.
  - `src/`: Contains the source code for the frontend.
  - `public/`: Contains static files such as the HTML file and images.
  - `build/`: Contains the production-ready build of the frontend.
- `prompts/`: Contains AI session prompts used during development.
- `README.md`: This file contains information about the project and instructions on how to run it.

## Project Structure

The project is divided into two main directories: `frontend` and `backend`.

### Frontend

The frontend is a React application, and its main files are located in the `src` directory. The `public` directory contains static assets, and the build directory contains the production `build` of the application.

### Backend

The backend is an Express application written in TypeScript using Firebase Admin SDK to interact with Firestore.
- The `src` directory contains the source code.
- Firebase credentials are configured via environment variables in `.env`.

## First steps

To get started with this project, follow these steps:

1. Clone the repo
2. Set up Firebase credentials:
   - Go to Firebase Console → Project Settings → Service Accounts → Generate new private key
   - Copy `backend/.env.example` to `backend/.env` and fill in your credentials
3. Install dependencies for frontend and backend:
```sh
cd frontend
npm install

cd ../backend
npm install
```
4. Build the backend server:
```
cd backend
npm run build
```
5. Run the backend server:
```
cd backend
npm run dev
```
6. In a new terminal window, build the frontend server:
```
cd frontend
npm run build
```
7. Start the frontend server:
```
cd frontend
npm start
```

The backend server will be running at http://localhost:3010, and the frontend will be available at http://localhost:3000.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Health check — returns `Hola LTI!` |
| POST | `/users` | Create a user document in Firestore |
| GET | `/users` | List all user documents from Firestore |

## Environment Variables

See `backend/.env.example` for all required variables. These map to your Firebase service account credentials:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`

# LTI - Sistema de Seguimiento de Talento  | ES

Este proyecto es una aplicación full-stack con un frontend en React y un backend en Express usando Firebase Admin SDK (Firestore) como base de datos. El frontend se inicia con Create React App y el backend está escrito en TypeScript.

## Explicación de Directorios y Archivos

- `backend/`: Contiene el código del lado del servidor escrito en Node.js.
  - `src/`: Contiene el código fuente para el backend.
    - `index.ts`: El punto de entrada para el servidor backend.
  - `tsconfig.json`: Archivo de configuración de TypeScript.
  - `.env`: Contiene las variables de entorno de la cuenta de servicio de Firebase.
  - `.env.example`: Plantilla con valores de ejemplo documentados.
- `frontend/`: Contiene el código del lado del cliente escrito en React.
  - `src/`: Contiene el código fuente para el frontend.
  - `public/`: Contiene archivos estáticos como el archivo HTML e imágenes.
  - `build/`: Contiene la construcción lista para producción del frontend.
- `prompts/`: Contiene los prompts de IA utilizados durante el desarrollo.
- `README.md`: Este archivo contiene información sobre el proyecto e instrucciones sobre cómo ejecutarlo.

## Estructura del Proyecto

El proyecto está dividido en dos directorios principales: `frontend` y `backend`.

### Frontend

El frontend es una aplicación React y sus archivos principales están ubicados en el directorio `src`. El directorio `public` contiene activos estáticos y el directorio `build` contiene la construcción de producción de la aplicación.

### Backend

El backend es una aplicación Express escrita en TypeScript que usa Firebase Admin SDK para interactuar con Firestore.
- El directorio `src` contiene el código fuente.
- Las credenciales de Firebase se configuran mediante variables de entorno en `.env`.

## Primeros Pasos

Para comenzar con este proyecto, sigue estos pasos:

1. Clona el repositorio.
2. Configura las credenciales de Firebase:
   - Ve a Firebase Console → Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada
   - Copia `backend/.env.example` a `backend/.env` y completa tus credenciales
3. Instala las dependencias para el frontend y el backend:
```sh
cd frontend
npm install

cd ../backend
npm install
```
4. Construye el servidor backend:
```
cd backend
npm run build
```
5. Inicia el servidor backend:
```
cd backend
npm run dev
```
6. En una nueva ventana de terminal, construye el servidor frontend:
```
cd frontend
npm run build
```
7. Inicia el servidor frontend:
```
cd frontend
npm start
```

El servidor backend estará corriendo en http://localhost:3010 y el frontend estará disponible en http://localhost:3000.

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Health check — devuelve `Hola LTI!` |
| POST | `/users` | Crea un documento de usuario en Firestore |
| GET | `/users` | Lista todos los documentos de usuario de Firestore |

## Variables de Entorno

Ver `backend/.env.example` para todas las variables requeridas. Corresponden a las credenciales de tu cuenta de servicio de Firebase:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
