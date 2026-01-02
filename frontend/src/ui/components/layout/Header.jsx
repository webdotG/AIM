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

           <UserProfile />
        </div>
        <SearchBar />          
        <div className="header-right">
        <ThemeSwitcher />
        <LanguageSwitcher />
       </div>

      {/* <div className="header-left">
      </div> */}


   
    </header>
  );
};

export default Header;