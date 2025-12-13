import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import { useDispatch } from 'react-redux';
import ClassService from '../../service/ClassService';
import Swal from 'sweetalert2';
const { joinClassByInviteCode } = ClassService();

const JoinClass = () => {
  const { inviteCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [message, setMessage] = useState('Đang xử lý...');

  useEffect(() => {
    // Nếu chưa đăng nhập thì chuyển hướng kèm redirect
    if (!user || !user.token) {
      setMessage('Bạn cần đăng nhập để tham gia lớp học.');
      navigate(`/login?redirect=/join-class/${inviteCode}`);
      return;
    }

    // Khi đã có token thì gọi join class
    const join = async () => {
      try {
        await joinClassByInviteCode(user.token, inviteCode, dispatch);
        navigate('/class');
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'You have successfully joined the class!'
        });
      } catch (err) {
        const msg =
          err?.message ||
          err?.response?.data?.message ||
          'Mã invite không hợp lệ hoặc bạn đã tham gia lớp này.';
        setMessage(msg);
      }
    };
    join();
  }, [user?.token, inviteCode, navigate, dispatch]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>Tham gia lớp học</h2>
      <p>{message}</p>
    </div>
  );
};

export default JoinClass;
