
import EntryCard from '../../components/entries/EntryCard/EntryCard';
import EntryList from '../../components/entries/EntryList/EntryList';
import EntryForm from '../../components/entries/EntryForm/EntryForm';
import Header from '../../components/layout/Header';


export default function EntryPage({ navigate }) {


  return (
    <div>
      <h1>Timeline</h1>
      <Header />
         <EntryList />
         <EntryCard />
         <EntryForm />

    </div>
  );
}