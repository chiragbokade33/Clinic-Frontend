import React from 'react'

const infoCards = [ 
  { 
    title: "Search Bar:", 
    message: 
      "Use the search bar to find branches by name or HF ID quickly.", 
  }, 
  { 
    title: "Toggle Button (Branch / Members):", 
    message: 
      "Use this to switch between the branch list and member list views. Currently, it is set to branch.", 
  }, 
  { 
    title: "Profile Card (Edit Icon):", 
    message: 
      "Click the edit icon on the branch profile card to update details such as address. (Note: Name, email, and pincode are not editable.)", 
  }, 
  { 
    title: "Add Branch Button:", 
    message: 
      "Click 'Add Branch' to create and register a new HF branch under your lab.", 
  }, 
  { 
    title: "Change Branch Button:", 
    message: 
      "Click this to switch to another branch profile. Once selected, you can send reports from that specific branch.", 
  }, 
]; 
const BranchInformation = () => {
  return (
    <div className="space-y-1"> 
      <h1 className="text-blue-800 font-bold text-md">Section Overview</h1> 
      <div className="border border-black mb-3" /> 
 
      {infoCards.map((card, index) => ( 
        <div key={index} className="border border-gray-400 bg-gray-100 rounded-md p-4 shadow-sm"> 
          <p className="font-semibold">{card.title}</p> 
          <p className="text-sm text-gray-700 mt-1">{card.message}</p> 
        </div> 
      ))} 
    </div> 
  )
}

export default BranchInformation