import React from 'react';

const Skeleton = ({ width, height, borderRadius = '0.5rem', className = '' }) => {
  return (
    <div
      className={`skeleton-loader ${className}`}
      style={{ width, height, borderRadius }}
    />
  );
};

export default Skeleton;
