
import React from "react";
import classNames from "classnames";
import { motion } from "framer-motion";

const CustomButton = ({ variant = "create", children, ...props }) => {
  const baseClass =
    "relative px-4 py-1 sm:px-6 sm:py-2 text-sm sm:text-base text-white font-bold rounded-md overflow-hidden group tracking-wider";

  const variantStyles = {
    create: {
      border: "border-1 sm:border-2 border-green-500",
      bgColor: "rgba(34, 197, 94, 0.2)", // Green with 20% opacity
      hoverShadow: "0 0 10px rgba(34, 197, 94, 0.5), 0 0 15px rgba(34, 197, 94, 0.3)",
      gradient: "from-transparent via-green-500 to-transparent",
    },
    cancel: {
      border: "border-1 sm:border-2 border-red-500",
      bgColor: "rgba(255, 77, 77, 0.2)", // Red with 20% opacity
      hoverShadow: "0 0 10px rgba(255, 77, 77, 0.5), 0 0 15px rgba(255, 77, 77, 0.3)",
      gradient: "from-transparent via-red-500 to-transparent",
    },
    edit: {
      border: "border-1 sm:border-2 border-yellow-400",
      bgColor: "rgba(255, 215, 0, 0.2)", // Yellow with 20% opacity
      hoverShadow: "0 0 10px rgba(255, 215, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.3)",
      gradient: "from-transparent via-yellow-400 to-transparent",
    },
  };

  const selected = variantStyles[variant];

  return (
    <motion.button
      className={classNames(baseClass, selected.border)}
      whileHover={{
        scale: 1.05,
        boxShadow: selected.hoverShadow,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      <motion.div
        className={classNames(
          "absolute inset-0 opacity-20 group-hover:opacity-100",
          `bg-gradient-to-r ${selected.gradient}`
        )}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
      <span
        className="relative z-10 group-hover:text-yellow transition-colors duration-300"
      >
        {children}
      </span>
    </motion.button>
  );
};

export default CustomButton;
