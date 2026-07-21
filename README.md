how to run the Project with code  

create the .env file fronten and backend both 

front end env code >
VITE_API_URL=http://localhost:5000/api

backend env code>
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/property_management
JWT_SECRET=harshitbhatt123
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
ADMIN_NAME=Admin
ADMIN_EMAIL=himanshubhatt050505@gmail.com
ADMIN_PASSWORD=admin123



open the folder in  code editor 
oper the terminal

run this command 
cd backend
npm install
npm run dev

open the new terminal and run tis command 

cd frontend
npm install
npm run dev
```

frontend : http://localhost:5173
backend : http://localhost:5000

