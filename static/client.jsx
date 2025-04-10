import { render } from 'solid-js/web';
import { createSignal } from 'solid-js';

// Basic page layout component
const PageLayout = (props) => {
  return (
    <>
      <header class="bg-blue-500 text-white p-4">
        <Navbar />
      </header>
      <main class="p-4">{props.children}</main>
      <footer class="bg-gray-200 text-center p-2">
        <p>&amp;copy; 2025 Multi-Destination Livestreaming Platform</p>
      </footer>
    </>
  );
};

// Navbar component
const Navbar = () => {
  return (
    <nav>
      <ul class="flex space-x-4">
        <li><a href="/">Home</a></li>
        <li><a href="/settings">Settings</a></li>
        <li><a href="/schedule">Schedule</a></li>
      </ul>
    </nav>
  );
};

// Home component
const Home = () => {
  return (
    <div>
      <h1>Welcome to the Multi-Destination Livestreaming Platform!</h1>
      <p>Manage your streams to YouTube and LinkedIn with ease.</p>
    </div>
  );
};

// Settings component
const Settings = () => {
  return (
    <div>
      <h1>Settings</h1>
      <p>Configure your streaming settings here.</p>
    </div>
  );
};

// Schedule component
const Schedule = () => {
  return (
    <div>
      <h1>Schedule</h1>
      <p>Schedule your upcoming streams.</p>
    </div>
  );
};

// Router component
const Router = () => {
  const [route, setRoute] = createSignal(globalThis.location.pathname);

  globalThis.addEventListener('popstate', () => {
    setRoute(globalThis.location.pathname);
  });

  const navigate = (path) => {
    globalThis.history.pushState(null, '', path);
    setRoute(path);
  }

  const routes = {
    '/': Home,
    '/settings': Settings,
    '/schedule': Schedule,
  };

  const Component = routes[route()] || Home;

  return (
    <PageLayout>
      <Component />
    </PageLayout>
  );
};

render(() => <Router />, document.getElementById('root'));