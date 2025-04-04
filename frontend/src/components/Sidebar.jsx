import React from "react";
import logo from "../assets/logo.png";
import RepoItem from "./RepoItem";
import {} from "react-icons";
import { UserButton } from "@clerk/clerk-react";
import { Button, Input, Modal } from "antd";
import { useState } from "react";

const Sidebar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  }
  return (
    <div className="text-white h-screen w-[270px] bg-[#1d1e30] pt-4 px-3">
      <div className="flex gap-3 justify-start items-end text-2xl mb-5">
        <img src={logo} alt="" className="w-8" />
        <p>PRism</p>
      </div>
      <button className="w-full bg-[#5866f2] flex justify-center py-4 rounded-xl mx-auto cursor-pointer active:bg-[#4854d9]"
      onClick={()=>showModal()}>
        Add Repository
      </button>
      <div>
        <div className="pt-8 text-md poppins-thin ml-1 mb-2">Repositories</div>
        <div className="">
          <RepoItem name={"Repo 1"} />
          <RepoItem name={"Repo 2"} />
          <RepoItem name={"Repo 3"} />
          <RepoItem name={"Repo 4"} />
        </div>
      </div>
      <Modal
        title="Add Repository Link"
        open={isModalOpen}
        centered
        onCancel={handleCancel}
        classNames={'!bg-[#1d1e30]'}>
        <Input/>
      </Modal>
    </div>
  );
};

export default Sidebar;
