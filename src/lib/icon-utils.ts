 
import { getIconComponent } from "@/components/ui/icon-picker";

interface MuiSvgPath {
  type: string;
  props: {
    d?: string;
    cx?: string;
    cy?: string;
    r?: string;
    [key: string]: unknown;
  };
}

export function getIconSvgDataUrl(iconName: string, color: string): string | null {
  const IconComponent = getIconComponent(iconName);
  if (!IconComponent) return null;

  try {
    const iconEl = (IconComponent as any).type.render({ muiName: "SvgIcon" });
    const viewBox = iconEl.props?.viewBox || "0 0 24 24";

    const children = iconEl.props?.children;
    if (!children) return null;

    const childArray = Array.isArray(children) ? children : [children];
    
    const svgParts: string[] = [];
    
    for (const child of childArray) {
      if (!child?.props) continue;
      
      if (child.type === "path" && child.props.d) {
        svgParts.push(`<path d="${child.props.d}" fill="${color}"/>`);
      } else if (child.type === "circle" && child.props.cx) {
        svgParts.push(`<circle cx="${child.props.cx}" cy="${child.props.cy}" r="${child.props.r}" fill="${color}"/>`);
      } else if (child.type === "rect" && child.props.x) {
        svgParts.push(`<rect x="${child.props.x}" y="${child.props.y}" width="${child.props.width || 0}" height="${child.props.height || 0}" fill="${color}"/>`);
      }
    }

    if (svgParts.length === 0) return null;

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="${viewBox}">${svgParts.join("")}</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  } catch {
    return null;
  }
}
