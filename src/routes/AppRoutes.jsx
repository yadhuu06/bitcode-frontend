import { Routes, Route } from 'react-router-dom';
import { routesConfig } from './routesConfig';

export default function AppRoutes() {
  return (
    <Routes>
      {routesConfig.map((route, i) => (
        <Route key={i} path={route.path} element={route.element}>
          {route.children?.map((child, j) => (
            <Route key={j} path={child.path} element={child.element}>
              {child.children?.map((sub, k) => (
                <Route key={k} path={sub.path} element={sub.element} />
              ))}
            </Route>
          ))}
        </Route>
      ))}
    </Routes>
  );
}
