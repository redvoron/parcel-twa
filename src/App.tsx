import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { routes } from "./utils/routes";
import MainPage from "./pages/Main";
// Компоненты для каждого маршрута


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        {routes.map((route) => (
          <Route
            key={route.name}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
