import React from 'react';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-100 h-full p-4">
      <h3 className="text-lg font-semibold mb-2">Rooms</h3>
      <ul>
        <li className="mb-1">📁 Web Dev</li>
        <li className="mb-1">📁 DSA</li>
        <li className="mb-1">📁 Cloud</li>
      </ul>
    </aside>
  );
};

export default Sidebar;
