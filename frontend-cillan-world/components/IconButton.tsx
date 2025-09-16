"use client";

import { ReactElement } from "react";

interface IconButtonProps {
  onClick: () => void;
  icon: ReactElement;
  className?: string;
}

const IconButton = ({ onClick, icon, className }: IconButtonProps) => {
  return (
    <button onClick={onClick} className={className} type="button">
      {icon}
    </button>
  );
};

export default IconButton;