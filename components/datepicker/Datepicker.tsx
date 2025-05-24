"use client";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Controller, useFormContext } from "react-hook-form";
import { format } from "date-fns";

interface DateTimePickerProps {
  name: string;
  control?: any; // Make control optional
  placeholder?: string;
  className?: string;
}

export const DateTimePicker = ({
  name,
  control,
  placeholder = "Select date and time",
  className = "",
}: DateTimePickerProps) => {
  const context = useFormContext();
  const finalControl = control || context?.control;

  if (!finalControl) {
    console.error(
      "DateTimePicker must be used with control prop or within FormProvider",
    );
    return (
      <div
        className={`px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full ${className}`}
      >
        Date picker error - missing form control
      </div>
    );
  }

  return (
    <Controller
      control={finalControl}
      name={name}
      render={({ field: { onChange, value } }) => (
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={(date) => {
            if (date) {
              // Format to 'YYYY-MM-DD HH:MM:SS'
              const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
              onChange(formattedDate);
            } else {
              onChange(null);
            }
          }}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          timeCaption="Time"
          placeholderText={placeholder}
          className={`px-3 py-2 bg-ev-primary-bg text-ev-dark-gray rounded-lg w-full ${className}`}
          wrapperClassName="w-full"
        />
      )}
    />
  );
};
