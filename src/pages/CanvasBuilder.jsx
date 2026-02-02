import { useParams } from 'react-router-dom';
import TopBar from '../components/Layout/TopBar';
import ElementsPanel from '../components/Panels/ElementsPanel';
import PropertiesPanel from '../components/Panels/PropertiesPanel';
import CanvasArea from '../components/Canvas/CanvasArea';
import PointsBalloon from '../components/Gamification/PointsBalloon';
import useQuizStore from '../store/quizStore';

export default function CanvasBuilder() {
  const { id } = useParams();
  const { pointsToShow } = useQuizStore();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar quizId={id} />
      
      <div className="flex flex-1 overflow-hidden">
        <ElementsPanel />
        
        <div className="flex-1 relative">
          <CanvasArea />
          
          {/* Gamification Balloons */}
          {pointsToShow.map((p) => (
            <PointsBalloon key={p.id} points={p.points} x={p.x} y={p.y} />
          ))}
        </div>
        
        <PropertiesPanel />
      </div>
    </div>
  );
}
