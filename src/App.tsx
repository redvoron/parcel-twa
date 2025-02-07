import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { routes } from "./utils/routes";
import MainPage from "./pages/Main";
import { GlobalContext } from "./main";
import { useContext } from "react";


function App() {
  const { webApp, userContext } = useContext(GlobalContext);
  console.log("AppPageContext", webApp, userContext);


  return (
    <BrowserRouter basename="/parcel-twa">
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
