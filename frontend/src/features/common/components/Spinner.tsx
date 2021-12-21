import { CSSProperties } from "react";

type SpinnerProps = {
  size: CSSProperties["width"];
  color: string;
  thickness: number;
  gap: number;
};

export const Spinner: React.FC<SpinnerProps> = ({
  size,
  color,
  thickness,
  gap,
}) => {
  return (
    <svg
      className="animate-spin"
      height={size}
      width={size}
      viewBox="0 0 32 32"
    >
      <circle
        cx={16}
        cy={16}
        r={14 - thickness / 2}
        stroke={color}
        fill="none"
        strokeWidth={thickness}
        strokeDasharray={Math.PI * 2 * (11 - gap)}
        strokeLinecap="round"
      />
    </svg>
  );
};
