import React from "react";
import "./GradesPage.scss";
import GradesComponents from "../../components/GradesComponents/GradesComponents";
import DetailScore from "../../components/GradesComponents/DetailScore/DetailScore";
import { getScoreCategoriesByClass } from "../../service/ScoreService";
import { useAuth } from "../../context/AuthProvider";
import AddCore from "../../components/GradesComponents/AddCore/AddCore";
const GradesPage = () => {
  const [activeDetail, setActiveDetail] = React.useState(false);
  const [activityAddCore, setActivityAddCore] = React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState(null);
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [selectedGroupId, setSelectedGroupId] = React.useState(null);
  const [categoriesLoading, setCategoriesLoading] = React.useState(false);
  const { user } = useAuth();
  const token = user?.token || null;
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  const handleActiveDetail = async (payload) => {
    // if payload provided, open the detail view for the given student and load categories
    if (payload && payload.student) {
      setCategoriesLoading(true);
      try {
        const classId = payload.classId;
        let cats = [];
        if (classId) {
          const data = await getScoreCategoriesByClass(classId, token);
          cats = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        }
  setSelectedStudent(payload.student);
  setSelectedCategories(cats);
  setSelectedGroupId(payload.groupId || null);
        setActiveDetail(true);
      } catch (e) {
        console.error('Failed to load categories', e);
        alert('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
      return;
    }

    // no payload: close detail view and clear selection
    setActiveDetail(false);
    setSelectedStudent(null);
    setSelectedCategories([]);
  };

  const handleActivityAddCore = () => {
    setActivityAddCore(!activityAddCore);
  };
  
  const handleScoreSaved = () => {
    // Trigger refresh in GradesComponents
    setRefreshTrigger((prev) => prev + 1);
  };
  
  console.log(activityAddCore);
  return (
    <div className="grades__page">
      <GradesComponents
        handleActiveDetail={handleActiveDetail}
        handleActivityAddCore={handleActivityAddCore}
        refreshTrigger={refreshTrigger}
      />
      {activeDetail && selectedStudent && (
        <DetailScore 
          handleActiveDetail={handleActiveDetail} 
          student={selectedStudent} 
          categories={selectedCategories} 
          loading={categoriesLoading} 
          groupId={selectedGroupId}
          onScoreSaved={handleScoreSaved}
        />
      )}
      {activityAddCore && (
        <AddCore handleActivityAddCore={handleActivityAddCore} />
      )}
    </div>
  );
};

export default GradesPage;
