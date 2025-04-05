import React from 'react'
import logo from '../assets/logo.png'
import RepoItem from './RepoItem'

const Sidebar = () => {
  return (
    <div className='text-white h-screen w-[270px] bg-[#1d1e30] pt-4 px-3'>
        <div className='flex gap-3 justify-start items-end text-2xl mb-5'>
            <img src={logo} alt="" className='w-8'/>
            <p>PRism</p>
        </div>
        <button className='w-full bg-[#5866f2] flex justify-center py-4 rounded-xl mx-auto'>Add Repository</button>
        <div>
          <div className='pt-8 text-md poppins-thin ml-1 mb-2'>Repositories</div>
          <div className=''>
            <RepoItem name={"Repo 1"}/>
            <RepoItem name={"Repo 2"}/>
            <RepoItem name={"Repo 3"}/>
            <RepoItem name={"Repo 4"}/>
          </div>
        </div>
    </div>
  )
}

export default Sidebar