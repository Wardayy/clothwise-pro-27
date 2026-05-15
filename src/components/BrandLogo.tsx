import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  textClassName?: string;
  taglineClassName?: string;
  asLink?: boolean;
}

const sizes = {
  sm: { img: "h-7 w-7", title: "text-sm", tag: "text-[10px]" },
  md: { img: "h-9 w-9", title: "text-base", tag: "text-[11px]" },
  lg: { img: "h-12 w-12", title: "text-xl", tag: "text-xs" },
  xl: { img: "h-16 w-16", title: "text-2xl", tag: "text-sm" },
};

export function BrandLogo({
  size = "md",
  showText = true,
  showTagline = false,
  className,
  textClassName,
  taglineClassName,
  asLink = false,
}: BrandLogoProps) {
  const s = sizes[size];
  const content = (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logo}
        alt="ClothWare logo"
        width={64}
        height={64}
        className={cn(s.img, "rounded-md object-contain shrink-0")}
        loading="lazy"
      />
      {showText && (
        <div className="leading-tight min-w-0">
          <h2 className={cn("font-heading font-bold tracking-tight truncate", s.title, textClassName)}>
            ClothWare
          </h2>
          {showTagline && (
            <p className={cn("text-muted-foreground truncate", s.tag, taglineClassName)}>
              Smart Textile Business Management
            </p>
          )}
        </div>
      )}
    </div>
  );
  return asLink ? <Link to="/dashboard">{content}</Link> : content;
}
