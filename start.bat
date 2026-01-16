@echo off
echo Starting React Frontend...
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
)

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file...
    echo VITE_API_BASE_URL=http://localhost:5000/api > .env
    echo .env file created.
)

REM Start frontend
echo.
echo Starting frontend on http://localhost:5173
echo.
call npm run dev
