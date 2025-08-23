'use client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useRef, useEffect } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import { faBell, faCalendarAlt, faLessThan } from '@fortawesome/free-solid-svg-icons';
import { LogOut, RotateCcw } from 'lucide-react';
import { getUsername } from '../hooks/GetitemsLocal';

const getStoredUserId = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }
  return null;
};

const getStoredRole = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("role");
  }
  return null;
};


const getStoredUserName = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("username");
  }
  return null;
};


const ClinicHeader = () => {
  // const username = localStorage.getItem("username")
  //  const Role = localStorage.getItem("role");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formattedStart, setFormattedStart] = useState("");
  const [formattedEnd, setFormattedEnd] = useState("");
  // const userId = localStorage.getItem("userId");
  const [notifyList, setNotifyList] = useState() as any;
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'all'>('today');
  const prevNotificationIds = useRef<Set<number>>(new Set());
  const router = useRouter();
  const [dropdownAnimating, setDropdownAnimating] = useState(false);

  // const [userId, setUserId] = useState<string | null>(null);
  const [userId] = useState<string | null>(getStoredUserId);
  const [Role] = useState<string | null>(getStoredRole);
  // const [username] = useState<string | null>(getStoredUserName);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserId = async () => {
      const Name = await getUsername();
      setUserName(Name);
    };
    fetchUserId();
  }, []);



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownAnimating(true);
    window.location.href = '/clinicLogin';
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("emailId");
    localStorage.removeItem("username");
    localStorage.removeItem("ClinicAdminId");
    localStorage.removeItem("switch");
    localStorage.removeItem("role");
  };


  const handleRevert = () => {
    setDropdownAnimating(true);
    router.push("/revertMember&Branch");
  };


  const toggleDrawer = () => {
    setShowDrawer(!showDrawer);
  };



  const getTabId = (tab: string): number => {
    switch (tab) {
      case 'today':
        return 1;
      case 'week':
        return 2;
      case 'all':
        return 3;
      default:
        throw new Error(`Invalid tab type: ${tab}`);
    }
  };



  // type Notification = { id: number; /* you can add more fields if needed */ };

  // const NotificationData = async () => {
  //   const id = getTabId(activeTab);
  //   try {
  //     // const response = await ListNotification(Number(userId), id, formattedStart, formattedEnd);
  //     const newNotifications: Notification[] = response.data.data;

  //     const newCount = newNotifications.length;
  //     const prevCountStr = localStorage.getItem("notificationCount");
  //     const prevCount = prevCountStr ? parseInt(prevCountStr) : 0;

  //     if (newCount !== prevCount) {
  //       const newIds = new Set<number>(newNotifications.map((n) => n.id));
  //       const addedNotifications = [...newIds].filter((id) => !prevNotificationIds.current.has(id));

  //       if (addedNotifications.length > 0) {
  //         toast.success(`${addedNotifications.length} new notification${addedNotifications.length > 1 ? 's' : ''} received`);
  //       }

  //       // Update localStorage and previous ref
  //       localStorage.setItem("notificationCount", newCount.toString());
  //       prevNotificationIds.current = newIds;
  //       setNotifyList(newNotifications);
  //     } else {
  //       // Only update state without showing toast
  //       prevNotificationIds.current = new Set<number>(newNotifications.map((n) => n.id));
  //       setNotifyList(newNotifications);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch notifications", err);
  //   }
  // };




  // useEffect(() => {
  //   NotificationData();
  // }, [activeTab, formattedStart, formattedEnd]);


  const toggleDatePicker = () => {
    setShowDatePicker((prev) => !prev);
  };

  const handleDateRangeSelect = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString("en-GB");
    const endStr = end.toLocaleDateString("en-GB");
    setFormattedStart(startStr);
    setFormattedEnd(endStr);
    setShowDatePicker(false)
  };

  const formatElapsedTime = (minutes: number): string => {
    if (!minutes || minutes <= 0) return "just now";

    const months = Math.floor(minutes / (60 * 24 * 30));
    const days = Math.floor((minutes % (60 * 24 * 30)) / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = minutes % 60;

    if (months > 0) return `${months}mo ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${mins}m ago`;
  };




  return (
    <div>
      <header className="sticky top-0 z-50 text-white px-6 py-2 flex justify-between items-center" style={{ backgroundColor: '#0331B5' }}>
        <div className="text-2xl font-bold flex items-center">
          <img
            src="/4bee03c0d8dd0050e8c60768d5eee76960b8b352.png"
            alt="hfiles logo"
            className="w-[154px] mr-2 cursor-pointer"
            style={{ backgroundColor: '#0331B5' }}
            onClick={() => (window.location.href = '/dashboard')}
          />
        </div>
        <div className="relative flex items-center space-x-3" ref={dropdownRef}>
          <div className="relative">
            {/* Bell Icon */}
            <FontAwesomeIcon
              icon={faBell}
              className="text-white text-xl cursor-pointer"
              onClick={toggleDrawer}
            />

            {/* Notification Count Badge */}
            {notifyList?.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce">
                {notifyList.length}
              </span>
            )}
          </div>

          <p className="text-white font-medium">{userName}</p>
          <img
            src="/proffile.jpg"
            alt="Profile"
            className="h-10 w-10 rounded-full border-2 border-yellow-400 cursor-pointer"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          {dropdownOpen && (
            <div
              className={`absolute right-0 top-3 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 transition-all duration-200 ${dropdownAnimating ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'
                }`}
            >
              {Role !== "Member" &&
                <button
                  onClick={handleRevert}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <RotateCcw size={14} className="mr-3 text-gray-500" />
                  Restore
                </button>
              }

              <hr className="my-1 border-gray-100" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 cursor-pointer"
              >
                <LogOut size={14} className="mr-3" />
                Sign Out
              </button>
            </div>
          )}

        </div>
      </header>

      {/* Notification Drawer */}
      <div
        className={`fixed top-20 right-0 h-full w-150  bg-white shadow-lg z-50 transform transition-transform duration-300 ${showDrawer ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div
          className="p-4 flex justify-between items-center text-black"
          style={{
            background: "linear-gradient(to bottom,white, #CAE5FF)",
            borderBottom: "1px solid #e5e7eb"
          }}
        >
          {/* Back Arrow */}
          <FontAwesomeIcon
            icon={faLessThan}
            className="text-lg cursor-pointer"
            onClick={toggleDrawer}
          />

          {/* Title */}
          <h2 className="text-lg font-semibold">History</h2>

          {/* Calendar Icon */}
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-lg cursor-pointer bg-black text-white p-2 rounded-full"
            onClick={toggleDatePicker}
          />

          {/* {showDatePicker && (
            <div className="absolute top-16 right-4 z-50">
              <CustomDatePicker onDateRangeSelect={handleDateRangeSelect} />
            </div>
          )} */}
        </div>

        <div className="p-2 space-y-3 overflow-y-auto h-screen pb-7">

          <div>
            {/* <LabHistoryTabs activeTab={activeTab} setActiveTab={setActiveTab} /> */}
          </div>
          {/* Notification 1 */}
          <div className="space-y-3">
            {notifyList?.map((item: any, index: any) => (
              <div
                key={`${item.reportType}-${index}`}
                className="border border-gray-300 p-3 rounded-lg flex items-start space-x-4 bg-white shadow-sm">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <img
                    src="/8de92dce1e8dad4d56f87b3ba7010553a16e7f7d.png"
                    alt="bell"
                    className="w-11 h-11 rounded bg-blue-800 p-2"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className={`font-bold text-sm ${item.isImportant ? 'text-blue-700' : 'text-gray-800'}`}>
                      {item.notifications}
                    </p>
                    <p className="text-xs text-gray-500">{formatElapsedTime(item.elapsedMinutes)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ClinicHeader;
