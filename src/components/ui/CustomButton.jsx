import React from "react";
import classNames from "classnames";

const CustomButton = ({ variant = "create", children, ...props }) => {
  const baseClass =
    "relative px-6 py-2 text-white font-bold rounded-md overflow-hidden group transition-all duration-300 tracking-wider";

  const variantStyles = {
    create: {
      border: "border border-green-500",
      glow: "group-hover:shadow-[0_0_10px_#00FF00,0_0_20px_#00FF00]",
      bgLine:
        "absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-linear bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-60",
    },
    cancel: {
      border: "border border-red-500",
      glow: "group-hover:shadow-[0_0_10px_#FF4D4D,0_0_20px_#FF4D4D]",
      bgLine:
        "absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-linear bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60",
    },
    edit: {
      border: "border border-yellow-400",
      glow: "group-hover:shadow-[0_0_10px_#FFD700,0_0_20px_#FFD700]",
      bgLine:
        "absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-linear bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-60",
    },
    primary: {
      border: "border border-blue-500",
      glow: "group-hover:shadow-[0_0_10px_#00B7EB,0_0_20px_#00B7EB]",
      bgLine:
        "absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-linear bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60",
    },
    back: {
      border: "border border-purple-500",
      glow: "group-hover:shadow-[0_0_10px_#A100F2,0_0_20px_#A100F2]",
      bgLine:
        "absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-1000 ease-linear bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60",
    },
  };

  const selected = variantStyles[variant];

  return (
    <button
      className={classNames(
        baseClass,
        selected.border,
        selected.glow,
        "group"
      )}
      {...props}
    >
      <span className={selected.bgLine}></span>
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default CustomButton;