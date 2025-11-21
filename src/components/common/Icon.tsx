import React from "react";
import { motion } from "framer-motion";
import {
  WiDaySunny,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
  WiDayCloudy,
} from "react-icons/wi";

export type IconType = "sunny" | "cloudy" | "rainy" | "storm" | "snow";

interface IconProps {
  type: IconType | string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ type, className }) => {
  const renderIcon = () => {
    switch (type) {
      case "sunny":
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="text-yellow-400"
          >
            <WiDaySunny />
          </motion.div>
        );
      case "cloudy":
        return (
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="text-gray-300"
          >
            <WiCloudy />
          </motion.div>
        );
      case "rainy":
        return (
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="text-blue-400"
          >
            <WiRain />
          </motion.div>
        );
      case "storm":
        return (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-purple-400"
          >
            <WiThunderstorm />
          </motion.div>
        );
      case "snow":
        return (
          <motion.div
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-white"
          >
            <WiSnow />
          </motion.div>
        );
      default:
        return <WiDayCloudy className="text-gray-400" />;
    }
  };

  return (
    <div className={`flex items-center justify-center ${className} text-5xl`}>
      {renderIcon()}
    </div>
  );
};

export default Icon;
