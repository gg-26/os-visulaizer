
import React from 'react';

interface SwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ id, label, checked, onChange, className = '' }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-300 select-none">
        {label}
      </label>
      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
        <input
          type="checkbox"
          name={id}
          id={id}
          checked={checked}
          onChange={onChange}
          className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer dark:bg-slate-400 dark:border-slate-700 checked:right-0 checked:border-green-500 checked:bg-white dark:checked:bg-green-400 dark:checked:border-green-700"
          style={{
            transition: 'right 0.2s ease-in-out, border-color 0.2s ease-in-out',
            right: checked ? '0px' : 'auto',
            borderColor: checked ? '' : '', // Tailwind classes will handle this
          }}
        />
        <label
          htmlFor={id}
          className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${checked ? 'bg-green-500 dark:bg-green-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        ></label>
      </div>
    </div>
  );
};

export default Switch;
