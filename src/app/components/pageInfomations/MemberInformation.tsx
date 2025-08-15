import React from "react"; 
 
const infoCards = [ 
  { 
    title: "Search Bar:", 
    message: 
      "Search for any member or admin by name or HF ID to manage them quickly.", 
  }, 
  { 
    title: "Toggle Button (Branch / Members):", 
    message: 
      "Use this to switch between the branch list and member list views. Currently, it is set to Members.", 
  }, 
  { 
    title: "Add Admin Button:", 
    message: 
      "Click 'Add Admin' to promote an existing team member to admin. You can also remove admins or team members from the list – but note that super admins cannot be removed.", 
  }, 
  { 
    title: "Manage Team Button:", 
    message: 
      "Use this to add new team members to your clinic and also remove existing ones when needed.", 
  }, 
]; 
 
const MembersInformation = () => { 
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
  ); 
}; 
 
export default MembersInformation;