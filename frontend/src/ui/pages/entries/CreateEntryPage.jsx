
import EntryForm from '../../components/entries/EntryForm/EntryForm'

import './CreateEntryPage.css';

const CreateEntryPage = () => {
  // console.log('CreateEntryPage рендерится');
  
  return (
    <div className="create-entry-page">
      {/* <h2>Создать запись</h2> */}

      <EntryForm />
    </div>
  );
};

export default CreateEntryPage;