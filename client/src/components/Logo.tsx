import { useTheme } from "@/hooks/use-theme";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Logo({ size = "md", className = "" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div
      className={`font-bold tracking-wider ${sizeClasses[size]} ${className}`}
      data-testid="logo"
    >
      <span className="text-foreground">BALLIST</span>
      <span className="text-primary">i</span>
      <span className="text-foreground">Q</span>
    </div>
  );
}