import React, { useState, useEffect } from 'react';
import './Schedules.scss';
import Calendar from '../../ScheduleComponents/Calendar/Calendar';
import { FaPlus } from 'react-icons/fa';
import AddScheduleForms from '../../ScheduleComponents/AddScheduleForm/AddScheduleForm';
import { useParams } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
const Schedules = () => {
  const { groupId } = useParams();
  const isPage = false;
  const [isShowAdd, setIsShowAdd] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const handleClose = () => {
    setIsShowAdd(false);
  };

  const handleCreated = () => {
    toast.success('Created Slot successfully!');
    setIsCreated((v) => !v);
    setIsShowAdd(false);
  };

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    });
  }, []);

  return (
    <div className="main__component">
      <Toaster position="bottom-right" richColors closeButton />
      <div className="main__component__container">
        <div className="main__component__container__heading">
          <div className="main__component__container__heading__title">
            <h2>Team schedule</h2>
          </div>

          <div className="main__component__container__heading__btn__add">
            <button onClick={() => setIsShowAdd(!isShowAdd)}>
              <FaPlus size={14} />
              <span>Add</span>
            </button>
          </div>
        </div>
        <Calendar groupId={groupId} />
      </div>

      {isShowAdd && (
        <AddScheduleForms
          groupId={groupId}
          onClose={handleClose}
          isCreated={isCreated}
          setIsCreated={setIsCreated}
          onSuccess={handleCreated}
          isPage={isPage}
        />
      )}
    </div>
  );
};

export default Schedules;
