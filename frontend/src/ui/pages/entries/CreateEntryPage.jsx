
import EntryForm from '../../components/entries/EntryForm/EntryForm'
import Header from '../../components/layout/Header';

import './CreateEntryPage.css';

const CreateEntryPage = () => {
  console.log('CreateEntryPage рендерится');
  
  return (
    <div className="create-entry-page">
      <h2>Создать запись</h2>

          {/* <Header /> */}
                <EntryForm />
    </div>
  );
};

export default CreateEntryPage;