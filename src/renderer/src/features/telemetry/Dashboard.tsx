import React from 'react'
import CpuWidget from './CpuWidget'
import MemoryWidget from './MemoryWidget'
import DiskWidget from './DiskWidget'
import NetworkWidget from './NetworkWidget'
import ProcessWidget from './ProcessWidget'

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CpuWidget />
        <MemoryWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <DiskWidget />
        <NetworkWidget />
      </div>

      <div className="mt-6">
        <ProcessWidget />
      </div>
    </>
  )
}

export default Dashboard
