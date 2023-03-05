export interface Navigation {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
  current: boolean;
}

export default Navigation;
