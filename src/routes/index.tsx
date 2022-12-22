import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Protected from '../components/Protected';
import Bucket from '../pages/Bucket';
import Login from '../pages/Login';
import MyBuckets from '../pages/MyBuckets';
const AppRoutes: React.FC = () => {

  return (
    <Suspense
      fallback={
        <div
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 70px)' }}
        >
          Loading...
        </div>
      }
    >
      <Routes>
        <Route
          path='/'
          element={
            <Protected>
              <MyBuckets />
            </Protected>
          }
        />
        <Route
          path='/:bucketId'
          element={
            <Protected>
              <Bucket />
            </Protected>
          }
        />
        <Route path='/login/*' element={<Login />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
