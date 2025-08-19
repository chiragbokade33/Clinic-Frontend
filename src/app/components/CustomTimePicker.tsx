import React, { useState, useRef, useEffect } from 'react';

interface CustomTimePickerProps {
  value?: Date | null;
  onChange: (value: Date) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  hasError?: boolean;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ 
  value, 
  onChange, 
  onBlur, 
  className = '', 
  placeholder,
  hasError = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState('01');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Generate hours array
  const hours = Array.from({ length: 12 }, (_, i) => 
    String(i + 1).padStart(2, '0')
  );

  // Generate minutes array (every 5 minutes)
  const minutes = Array.from({ length: 12 }, (_, i) => 
    String(i * 5).padStart(2, '0')
  );

  const periods: Array<'AM' | 'PM'> = ['AM', 'PM'];

  // Initialize values from prop
  useEffect(() => {
    if (value) {
      const hour = value.getHours();
      const minute = value.getMinutes();
      const period: 'AM' | 'PM' = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      
      setSelectedHour(String(displayHour).padStart(2, '0'));
      setSelectedMinute(String(Math.round(minute / 5) * 5).padStart(2, '0'));
      setSelectedPeriod(period);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayTime = () => {
    if (!value) return placeholder || 'Select time';
    const hour = value.getHours();
    const minute = value.getMinutes();
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  const handleOK = () => {
    const hour24 = selectedPeriod === 'AM' 
      ? (selectedHour === '12' ? 0 : parseInt(selectedHour))
      : (selectedHour === '12' ? 12 : parseInt(selectedHour) + 12);
    
    const newTime = new Date();
    newTime.setHours(hour24, parseInt(selectedMinute), 0, 0);
    
    onChange(newTime);
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (onBlur) onBlur();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input Display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border rounded-md px-4 py-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          hasError ? 'border-red-500 bg-red-50' : 'border-gray-700'
        } ${className}`}
      >
        {formatDisplayTime()}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-80">
          <div className="p-4">
            {/* Time Selection Grid */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Hours Column */}
              <div className="text-center">
                <div className="font-semibold text-gray-700 mb-2 text-sm">Hour</div>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      onClick={() => setSelectedHour(hour)}
                      className={`py-2 px-3 cursor-pointer text-sm font-medium hover:bg-blue-50 ${
                        selectedHour === hour 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700'
                      }`}
                    >
                      {hour}
                    </div>
                  ))}
                </div>
              </div>

              {/* Minutes Column */}
              <div className="text-center">
                <div className="font-semibold text-gray-700 mb-2 text-sm">Minute</div>
                <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                  {minutes.map((minute) => (
                    <div
                      key={minute}
                      onClick={() => setSelectedMinute(minute)}
                      className={`py-2 px-3 cursor-pointer text-sm font-medium hover:bg-blue-50 ${
                        selectedMinute === minute 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700'
                      }`}
                    >
                      {minute}
                    </div>
                  ))}
                </div>
              </div>

              {/* AM/PM Column */}
              <div className="text-center">
                <div className="font-semibold text-gray-700 mb-2 text-sm">Period</div>
                <div className="border border-gray-200 rounded">
                  {periods.map((period) => (
                    <div
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={`py-2 px-3 cursor-pointer text-sm font-medium hover:bg-blue-50 ${
                        selectedPeriod === period 
                          ? 'bg-blue-500 text-white' 
                          : 'text-gray-700'
                      }`}
                    >
                      {period}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleOK}
                className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
