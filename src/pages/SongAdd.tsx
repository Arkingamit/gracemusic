
import SongForm from '@/components/SongForm';

const SongAdd = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Add New Song</h1>
      <SongForm />
    </div>
  );
};

export default SongAdd;
