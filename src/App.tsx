import "./App.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { routes } from "./utils/routes";
import MainPage from "./pages/Main";
import { GlobalContext } from "./main";
import { useContext } from "react";
import { AuthResultType } from "./utils/constants";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
const isDev = import.meta.env.MODE === "development";
function App() {
  const { webApp, userContext } = useContext(GlobalContext);
  console.log("AppPageContext", webApp, userContext);
  const { result, data } = userContext;
  const userAuthId = (result === AuthResultType.SUCCESS ? data : null) || isDev;
  if (!userAuthId) {
    return (
      <Flex align="center" justify="center" style={{ height: "100vh" }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 72 }} spin />} />
      </Flex>
    );
  }
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
