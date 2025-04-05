import React from 'react'
import Sidebar from '../components/Sidebar'
import SummarySection from '../components/SummarySection'

const Main = () => {
  return (
    <>
    <div className='flex poppins-regular'>
        <Sidebar/>
        <SummarySection/>
    </div>
    </>
  )
}

export default Main