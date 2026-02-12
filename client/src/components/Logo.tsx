import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import logoImg from "@assets/Logo_1770890960676.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const { theme } = useTheme();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setRotation(window.scrollY * 0.15);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const imgSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-14 h-14",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  const filterStyle: React.CSSProperties = theme === "dark"
    ? {
        filter:
          "brightness(0) saturate(100%) invert(55%) sepia(80%) saturate(500%) hue-rotate(155deg) brightness(95%)",
        transform: `rotate(${rotation}deg)`,
        transition: "filter 0.3s ease",
      }
    : {
        filter: "brightness(0)",
        transform: `rotate(${rotation}deg)`,
        transition: "filter 0.3s ease",
      };

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      data-testid="logo"
    >
      <img
        src={logoImg}
        alt="BALLISTiQ logo"
        className={`${imgSizes[size]} flex-shrink-0`}
        style={filterStyle}
        data-testid="img-logo"
      />
      <div className={`font-bold tracking-wider ${textSizes[size]}`}>
        <span className="text-foreground">BALLIST</span>
        <span className="text-primary">i</span>
        <span className="text-foreground">Q</span>
      </div>
    </div>
  );
}
