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
      <span style={{ color: "rgb(255, 255, 255)" }}>BALLIST</span>
      <span style={{ color: "rgb(0, 151, 178)" }}>i</span>
      <span style={{ color: "rgb(255, 255, 255)" }}>Q</span>
    </div>
  );
}