import React from 'react'

const RepoItem = (props) => {
  return (
    <div className='w-full poppins-thin py-1.5 duration-300 rounded-lg cursor-pointer hover:bg-[#131420] flex items-center px-4'>
        {props.name}
    </div>
  )
}

export default RepoItem