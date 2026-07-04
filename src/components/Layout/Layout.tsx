import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

export default function Layout() {
  return (
    <div className="app-layout grid-bg">
      <Sidebar />
      <TopNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
