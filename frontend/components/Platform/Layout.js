import NavigationBar from './NavigationBar';

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <NavigationBar />
      <main className="flex-1">
        {/* Main content goes here */}
        {children}
      </main>
    </div>
  );
};

export default Layout;