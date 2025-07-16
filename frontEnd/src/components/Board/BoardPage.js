import { Routes, Route } from 'react-router-dom';
import BoardList from './BoardList';
import BoardWrite from './BoardWrite';
import BoardDetail from './BoardDetail';
import BoardEdit from './BoardEdit';

export default function BoardPage() {
  return (
    <Routes>
      <Route path="/" element={<BoardList />} />
      <Route path="write" element={<BoardWrite />} />
      <Route path=":id" element={<BoardDetail />} />
      <Route path=":id/edit" element={<BoardEdit />} />
    </Routes>
  );
}
