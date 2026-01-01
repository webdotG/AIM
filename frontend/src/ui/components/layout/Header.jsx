import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import UserProfile from './UserProfile';
import './Header.css';

const Header = () => {
  return (
    <header className="header">

        
        <div className="header-brand">
          <h1 className="header-title">AIM</h1>
          <span className="header-version">v0.1.0</span>
        </div>
                <div className="header-right">
        <UserProfile />
        <ThemeSwitcher />
        <LanguageSwitcher />


      <div className="header-left">
      </div>
        <SearchBar />

      </div>
    </header>
  );
};

export default Header;