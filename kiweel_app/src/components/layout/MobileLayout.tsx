import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { Header } from "./Header";
import { spacing, containerSpacing } from "../../design/tokens/spacing";

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  showHeader?: boolean;
  fixedHeader?: boolean;
  safeArea?: boolean;
}

export function MobileLayout({ 
  children, 
  showNav = true, 
  showHeader = true, 
  fixedHeader = false,
  safeArea = true 
}: MobileLayoutProps) {
  
  const layoutStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'hsl(var(--background))',
    paddingBottom: showNav ? spacing.tabBar : 0,
    
    // Safe area handling for React Native compatibility
    ...(safeArea && {
      paddingTop: showHeader ? 0 : containerSpacing.safeArea.top,
    }),
  };

  const mainStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: containerSpacing.maxWidth.mobile,
    marginLeft: 'auto',
    marginRight: 'auto',
    
    // Remove desktop-first max-width
    // Mobile-first approach: full width on mobile
  };

  return (
    <div style={layoutStyle}>
      {showHeader && <Header fixed={fixedHeader} />}
      <main style={mainStyle}>
        {children}
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
