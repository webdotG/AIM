import SearchBar from './SearchBar';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-brand">
          <h1 className="header-title">AIM</h1>
          <span className="header-version">v0.1.0</span>
        </div>
        
        <SearchBar />
      </div>

      <div className="header-right">
        <ThemeSwitcher />
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;